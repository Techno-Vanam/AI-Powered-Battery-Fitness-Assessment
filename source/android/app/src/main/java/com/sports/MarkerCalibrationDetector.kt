package com.sports

import android.graphics.Bitmap
import android.util.Log
import boofcv.abst.fiducial.FiducialDetector
import boofcv.android.ConvertBitmap
import boofcv.factory.fiducial.ConfigFiducialBinary
import boofcv.factory.fiducial.FactoryFiducial
import boofcv.factory.filter.binary.ConfigThreshold
import boofcv.factory.filter.binary.ThresholdType
import boofcv.struct.image.GrayU8
import georegression.struct.point.Point2D_F64
import georegression.struct.shapes.Polygon2D_F64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Sit & Reach reference-marker calibration.
 *
 * STEP 4:
 * LIVE MARKER VISIBILITY + LOCKED CALIBRATION
 *
 * Development reference layout:
 *
 *      ID1 ---------------- ID2
 *      (0,0)               (30,0)
 *
 *       |                    |
 *       |                    | 15 cm
 *       |                    |
 *
 *      ID3 ---------------- ID4
 *      (0,15)              (30,15)
 *
 * IMPORTANT:
 *
 * 30 x 15 cm is currently DEVELOPMENT calibration geometry.
 * It must NOT be assumed to be the final physical Sit & Reach
 * ruler dimensions.
 *
 * STEP 4 behaviour:
 *
 * 1. Detect IDs 1,2,3,4.
 * 2. Require 5 stable detections.
 * 3. Compute homography.
 * 4. LOCK the homography.
 * 5. If markers disappear:
 *
 *      markersVisible = false
 *      locked         = true
 *      valid          = true
 *      homography     = preserved
 *
 * 6. reset() removes the locked calibration and starts again.
 *
 * Camera must remain fixed after calibration is locked.
 */
object MarkerCalibrationDetector {

    private const val TAG = "SitReachCalibration"

    // ============================================================
    // DEVELOPMENT REFERENCE GEOMETRY
    // ============================================================

    /**
     * TEMPORARY development coordinates.
     *
     * These values are NOT yet the final physical Sit & Reach
     * ruler calibration.
     */
    /*
     * Distance between marker centres.
     *
     * This is the calibration reference geometry.
     *
     * It is NOT the physical width/height of the Sit & Reach box.
     */
    const val MARKER_GRID_WIDTH_CM = 30.0
    const val MARKER_GRID_HEIGHT_CM = 15.0

    private const val MARKER_ID_1 = 1
    private const val MARKER_ID_2 = 2
    private const val MARKER_ID_3 = 3
    private const val MARKER_ID_4 = 4

    private val REQUIRED_IDS =
        setOf(
            MARKER_ID_1,
            MARKER_ID_2,
            MARKER_ID_3,
            MARKER_ID_4
        )

    // ============================================================
    // STABILITY
    // ============================================================

    private const val STABILITY_REQUIRED = 5

    /**
     * Run BoofCV marker detection every 500 ms.
     */
    private const val DETECTION_INTERVAL_MS = 500L

    /**
     * Maximum marker-center movement between consecutive
     * successful calibration detections.
     */
    private const val MAX_JUMP_FRACTION = 0.05

    /**
     * Minimum separation between board marker centers.
     */
    private const val MIN_SPACING_FRACTION = 0.08

    // ============================================================
    // INDIVIDUAL MARKER VALIDATION
    // ============================================================

    private const val MIN_MARKER_EDGE_FRACTION = 0.025
    private const val MAX_MARKER_EDGE_FRACTION = 0.45

    private const val MAX_MARKER_EDGE_RATIO = 2.25
    private const val MAX_MARKER_DIAGONAL_RATIO = 2.25

    private const val MIN_MARKER_FILL_RATIO = 0.35

    // ============================================================
    // FOUR-MARKER BOARD VALIDATION
    // ============================================================

    private const val MAX_MARKER_SIZE_RATIO = 3.0

    private const val MAX_OPPOSITE_SIDE_RATIO = 2.75
    private const val MAX_OPPOSITE_VERTICAL_RATIO = 2.75

    private const val MIN_BOARD_AREA_FRACTION = 0.015

    // ============================================================
    // BOOFCV
    // ============================================================

    @Volatile
    private var detector: FiducialDetector<GrayU8>? = null

    // ============================================================
    // LIVE DETECTION STATE
    // ============================================================

    /**
     * Stability belongs to the CURRENT calibration acquisition.
     */
    @Volatile
    private var stabilityCount = 0

    /**
     * True only when all four markers are currently visible and
     * valid in the most recent real BoofCV detection cycle.
     */
    @Volatile
    private var markersVisible = false

    // ============================================================
    // LOCKED CALIBRATION STATE
    // ============================================================

    /**
     * Once true, the calibration transform survives marker loss.
     *
     * It becomes false only after reset().
     */
    @Volatile
    private var calibrationLocked = false

    /**
     * Locked homography:
     *
     * IMAGE PIXELS -> DEVELOPMENT REFERENCE COORDINATES
     *
     * This survives marker loss.
     */
    @Volatile
    private var lockedHomography: DoubleArray? = null

    /**
     * Marker positions used at the exact moment calibration
     * became locked.
     *
     * These are kept separately from the live markers.
     */
    private var lockedM1: Point2D_F64? = null
    private var lockedM2: Point2D_F64? = null
    private var lockedM3: Point2D_F64? = null
    private var lockedM4: Point2D_F64? = null

    // ============================================================
    // CURRENT / PREVIOUS LIVE MARKERS
    // ============================================================

    private var prevM1: Point2D_F64? = null
    private var prevM2: Point2D_F64? = null
    private var prevM3: Point2D_F64? = null
    private var prevM4: Point2D_F64? = null

    // ============================================================
    // TIMING
    // ============================================================

    private var lastDetectionMs = 0L
    private var lastRawLogMs = 0L
    private var lastLogMs = 0L

    // ============================================================
    // DATA TYPES
    // ============================================================

    data class MarkerPoint(
        val x: Double,
        val y: Double
    )

    private data class ValidatedMarker(
        val id: Int,
        val center: Point2D_F64,
        val bounds: Polygon2D_F64,
        val averageEdge: Double,
        val area: Double
    )

    data class CalibrationResult(
        val id1: MarkerPoint?,
        val id2: MarkerPoint?,
        val id3: MarkerPoint?,
        val id4: MarkerPoint?,

        val stabilityCount: Int,

        /**
         * valid means:
         *
         * A usable calibration transform exists.
         *
         * Therefore after locking this remains true even when
         * markers are no longer visible.
         */
        val calibrationValid: Boolean,

        /**
         * True only when all four markers are currently visible.
         */
        val markersVisible: Boolean,

        /**
         * True after 5/5 and successful homography creation.
         */
        val calibrationLocked: Boolean,

        /**
         * Locked homography when available.
         */
        val homography: DoubleArray?,

        val failReason: String?
    )

    // ============================================================
    // INITIALISE DETECTOR
    // ============================================================

    private fun ensureDetector() {

        if (detector != null) {
            return
        }

        synchronized(this) {

            if (detector != null) {
                return
            }

            try {

                val cfg =
                    ConfigFiducialBinary(0.1)

                val thresh =
                    ConfigThreshold.local<ConfigThreshold>(
                        ThresholdType.LOCAL_MEAN,
                        21
                    )

                detector =
                    FactoryFiducial.squareBinary(
                        cfg,
                        thresh,
                        GrayU8::class.java
                    )

                Log.d(
                    TAG,
                    "[SitReachCalibration] BoofCV squareBinary detector initialised"
                )

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "[SitReachCalibration] Detector init failed: ${e.message}",
                    e
                )
            }
        }
    }

    // ============================================================
    // MAIN PROCESS
    // ============================================================

    @JvmStatic
    fun process(bitmap: Bitmap): CalibrationResult {

        ensureDetector()

        val det =
            detector ?: return currentResult(
                "Detector not initialised"
            )

        val now =
            System.currentTimeMillis()

        // ========================================================
        // THROTTLE
        // ========================================================

        if (
            now - lastDetectionMs <
            DETECTION_INTERVAL_MS
        ) {

            return currentResult()
        }

        lastDetectionMs = now

        // ========================================================
        // BITMAP -> GRAY
        // ========================================================

        val gray: GrayU8

        try {

            gray =
                ConvertBitmap.bitmapToGray(
                    bitmap,
                    null as GrayU8?,
                    null
                )

        } catch (e: Exception) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Bitmap conversion failed"
                }
            )
        }

        // ========================================================
        // RUN BOOFCV DETECTION
        // ========================================================

        try {

            det.detect(gray)

        } catch (e: Exception) {

            Log.e(
                TAG,
                "[SitReachCalibration] Detection exception",
                e
            )

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Detector exception"
                }
            )
        }

        val foundCount =
            det.totalFound()

        // ========================================================
        // RAW LOG
        // ========================================================

        val shouldRawLog =
            now - lastRawLogMs >= 1000L

        if (shouldRawLog) {

            lastRawLogMs = now

            Log.d(
                TAG,
                "[SitReachCalibration] RAW bitmap=${gray.width}x${gray.height} totalFound=$foundCount"
            )
        }

        // ========================================================
        // NOTHING FOUND
        // ========================================================

        if (foundCount == 0) {

            clearOnlyLiveMarkers()

            if (calibrationLocked) {

                Log.d(
                    TAG,
                    "[SitReachCalibration] LIVE markers not visible; LOCKED calibration preserved"
                )

                return currentResult()
            }

            Log.d(
                TAG,
                "[SitReachCalibration] No live markers -> waiting for calibration"
            )

            return currentResult(
                "Waiting for all 4 reference markers"
            )
        }

        // ========================================================
        // VALIDATE DETECTED FIDUCIALS
        // ========================================================

        val markers =
            mutableMapOf<Int, ValidatedMarker>()

        var suspiciousRequiredMarker = false

        for (index in 0 until foundCount) {

            val id =
                det.getId(index).toInt()

            val center =
                Point2D_F64()

            det.getCenter(
                index,
                center
            )

            if (shouldRawLog) {

                Log.d(
                    TAG,
                    "[SitReachCalibration] RAW index=$index id=$id center=(${center.x.toInt()},${center.y.toInt()})"
                )
            }

            // Ignore unrelated IDs.
            if (id !in REQUIRED_IDS) {
                continue
            }

            // Duplicate required ID is suspicious.
            if (markers.containsKey(id)) {

                Log.w(
                    TAG,
                    "[SitReachCalibration] REJECT duplicate required ID=$id"
                )

                suspiciousRequiredMarker = true
                break
            }

            val bounds =
                try {

                    det.getBounds(
                        index,
                        null
                    )

                } catch (e: Exception) {

                    Log.w(
                        TAG,
                        "[SitReachCalibration] REJECT ID$id unable to read bounds"
                    )

                    null
                }

            if (bounds == null) {

                suspiciousRequiredMarker = true
                break
            }

            val validation =
                validateMarker(
                    id = id,
                    center = center,
                    bounds = bounds,
                    imageWidth = gray.width,
                    imageHeight = gray.height
                )

            if (validation == null) {

                Log.w(
                    TAG,
                    "[SitReachCalibration] REJECT ID$id invalid quadrilateral"
                )

                suspiciousRequiredMarker = true
                break
            }

            markers[id] =
                validation
        }

        // ========================================================
        // BAD REQUIRED MARKER
        // ========================================================

        if (suspiciousRequiredMarker) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Invalid marker geometry"
                }
            )
        }

        // ========================================================
        // ALL FOUR REQUIRED IN CURRENT DETECTION?
        // ========================================================

        if (
            markers.size != 4 ||
            !markers.keys.containsAll(REQUIRED_IDS)
        ) {

            Log.d(
                TAG,
                "[SitReachCalibration] LIVE only ${markers.size}/4 required markers visible"
            )

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Waiting for all 4 reference markers"
                }
            )
        }

        val marker1 =
            markers[MARKER_ID_1]!!

        val marker2 =
            markers[MARKER_ID_2]!!

        val marker3 =
            markers[MARKER_ID_3]!!

        val marker4 =
            markers[MARKER_ID_4]!!

        val p1 =
            marker1.center

        val p2 =
            marker2.center

        val p3 =
            marker3.center

        val p4 =
            marker4.center

        // ========================================================
        // MARKER SIZE CONSISTENCY
        // ========================================================

        val markerSizes =
            doubleArrayOf(
                marker1.averageEdge,
                marker2.averageEdge,
                marker3.averageEdge,
                marker4.averageEdge
            )

        val smallestMarker =
            markerSizes.minOrNull() ?: 0.0

        val largestMarker =
            markerSizes.maxOrNull() ?: 0.0

        if (
            smallestMarker <= 0.0 ||
            largestMarker / smallestMarker >
            MAX_MARKER_SIZE_RATIO
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Reference marker sizes inconsistent"
                }
            )
        }

        // ========================================================
        // CORRECT ID ORDER
        // ========================================================

        if (
            p1.x >= p2.x ||
            p3.x >= p4.x ||
            p1.y >= p3.y ||
            p2.y >= p4.y
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Incorrect marker ordering"
                }
            )
        }

        // ========================================================
        // MINIMUM SPACING
        // ========================================================

        val minSpacing =
            gray.width.toDouble() *
            MIN_SPACING_FRACTION

        val top =
            distance(
                p1,
                p2
            )

        val bottom =
            distance(
                p3,
                p4
            )

        val left =
            distance(
                p1,
                p3
            )

        val right =
            distance(
                p2,
                p4
            )

        if (
            top < minSpacing ||
            bottom < minSpacing ||
            left < minSpacing ||
            right < minSpacing
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Reference markers too close"
                }
            )
        }

        // ========================================================
        // OPPOSITE SIDE CONSISTENCY
        // ========================================================

        if (
            ratio(
                top,
                bottom
            ) > MAX_OPPOSITE_SIDE_RATIO
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Top/bottom board geometry inconsistent"
                }
            )
        }

        if (
            ratio(
                left,
                right
            ) > MAX_OPPOSITE_VERTICAL_RATIO
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Left/right board geometry inconsistent"
                }
            )
        }

        // ========================================================
        // BOARD AREA
        // ========================================================

        val boardArea =
            polygonArea(
                listOf(
                    p1,
                    p2,
                    p4,
                    p3
                )
            )

        val imageArea =
            gray.width.toDouble() *
            gray.height.toDouble()

        if (
            boardArea <
            imageArea *
            MIN_BOARD_AREA_FRACTION
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Reference board area too small"
                }
            )
        }

        // ========================================================
        // CONVEX BOARD
        // ========================================================

        if (
            !isConvexQuad(
                p1,
                p2,
                p4,
                p3
            )
        ) {

            clearOnlyLiveMarkers()

            return currentResult(
                if (calibrationLocked) {
                    null
                } else {
                    "Reference board geometry invalid"
                }
            )
        }

        // ========================================================
        // MARKERS ARE CURRENTLY VISIBLE
        // ========================================================

        markersVisible = true

        // ========================================================
        // ALREADY LOCKED?
        //
        // IMPORTANT:
        //
        // Once locked we DO NOT replace the saved homography
        // automatically.
        //
        // This prevents accidental recalibration during the test.
        // reset() must be called to intentionally recalibrate.
        // ========================================================

        if (calibrationLocked) {

            prevM1 =
                copyPoint(p1)

            prevM2 =
                copyPoint(p2)

            prevM3 =
                copyPoint(p3)

            prevM4 =
                copyPoint(p4)

            Log.d(
                TAG,
                "[SitReachCalibration] Markers visible; calibration already LOCKED"
            )

            return currentResult()
        }

        // ========================================================
        // FRAME-TO-FRAME CONTINUITY
        // ========================================================

        val maxJump =
            gray.width.toDouble() *
            MAX_JUMP_FRACTION

        val hasPrevious =
            prevM1 != null &&
            prevM2 != null &&
            prevM3 != null &&
            prevM4 != null

        if (hasPrevious) {

            val suddenJump =
                distance(
                    p1,
                    prevM1!!
                ) > maxJump ||
                distance(
                    p2,
                    prevM2!!
                ) > maxJump ||
                distance(
                    p3,
                    prevM3!!
                ) > maxJump ||
                distance(
                    p4,
                    prevM4!!
                ) > maxJump

            if (suddenJump) {

                Log.w(
                    TAG,
                    "[SitReachCalibration] REJECT sudden marker movement during calibration"
                )

                clearAcquisitionState()

                return currentResult(
                    "Reference markers moved"
                )
            }
        }

        // ========================================================
        // VALID CURRENT DETECTION
        // ========================================================

        prevM1 =
            copyPoint(p1)

        prevM2 =
            copyPoint(p2)

        prevM3 =
            copyPoint(p3)

        prevM4 =
            copyPoint(p4)

        stabilityCount =
            (
                stabilityCount + 1
            ).coerceAtMost(
                STABILITY_REQUIRED
            )

        Log.d(
            TAG,
            "[SitReachCalibration] LIVE VALID FRAME stability=$stabilityCount/$STABILITY_REQUIRED"
        )

        // ========================================================
        // 5/5 -> COMPUTE AND LOCK HOMOGRAPHY
        // ========================================================

        if (
            stabilityCount >=
            STABILITY_REQUIRED
        ) {

            val h =
                computeHomography(
                    p1,
                    p2,
                    p3,
                    p4
                )

            if (h == null) {

                clearAcquisitionState()

                return currentResult(
                    "Degenerate homography"
                )
            }

            // ----------------------------------------------------
            // LOCK TRANSFORM
            // ----------------------------------------------------

            lockedHomography =
                h.copyOf()

            lockedM1 =
                copyPoint(p1)

            lockedM2 =
                copyPoint(p2)

            lockedM3 =
                copyPoint(p3)

            lockedM4 =
                copyPoint(p4)

            calibrationLocked =
                true

            stabilityCount =
                STABILITY_REQUIRED

            Log.d(
                TAG,
                "[SitReachCalibration] ========================================"
            )

            Log.d(
                TAG,
                "[SitReachCalibration] CALIBRATION LOCKED"
            )

            Log.d(
                TAG,
                "[SitReachCalibration] Transform: READY"
            )

            Log.d(
                TAG,
                "[SitReachCalibration] Camera must remain fixed"
            )

            Log.d(
                TAG,
                "[SitReachCalibration] ========================================"
            )
        }

        logPeriodically(
            p1,
            p2,
            p3,
            p4
        )

        return currentResult(
            if (calibrationLocked) {
                null
            } else {
                "Validating reference markers"
            }
        )
    }

    // ============================================================
    // INDIVIDUAL MARKER VALIDATION
    // ============================================================

    private fun validateMarker(
        id: Int,
        center: Point2D_F64,
        bounds: Polygon2D_F64,
        imageWidth: Int,
        imageHeight: Int
    ): ValidatedMarker? {

        if (bounds.size() != 4) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: bounds=${bounds.size()}"
            )

            return null
        }

        val corners =
            mutableListOf<Point2D_F64>()

        for (i in 0 until 4) {

            val p =
                bounds.get(i)

            if (
                !p.x.isFinite() ||
                !p.y.isFinite()
            ) {
                return null
            }

            if (
                p.x < -5.0 ||
                p.y < -5.0 ||
                p.x > imageWidth + 5.0 ||
                p.y > imageHeight + 5.0
            ) {
                return null
            }

            corners.add(
                Point2D_F64(
                    p.x,
                    p.y
                )
            )
        }

        // ========================================================
        // EDGE LENGTHS
        // ========================================================

        val e0 =
            distance(
                corners[0],
                corners[1]
            )

        val e1 =
            distance(
                corners[1],
                corners[2]
            )

        val e2 =
            distance(
                corners[2],
                corners[3]
            )

        val e3 =
            distance(
                corners[3],
                corners[0]
            )

        val edges =
            doubleArrayOf(
                e0,
                e1,
                e2,
                e3
            )

        val shortest =
            edges.minOrNull()
                ?: return null

        val longest =
            edges.maxOrNull()
                ?: return null

        val average =
            edges.average()

        val minAllowed =
            imageWidth.toDouble() *
            MIN_MARKER_EDGE_FRACTION

        val maxAllowed =
            imageWidth.toDouble() *
            MAX_MARKER_EDGE_FRACTION

        if (
            shortest <
            minAllowed
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: marker too small"
            )

            return null
        }

        if (
            longest >
            maxAllowed
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: marker too large"
            )

            return null
        }

        if (
            shortest <= 0.0 ||
            longest / shortest >
            MAX_MARKER_EDGE_RATIO
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: edge ratio=${longest / max(shortest, 0.0001)}"
            )

            return null
        }

        // ========================================================
        // DIAGONALS
        // ========================================================

        val diagonal1 =
            distance(
                corners[0],
                corners[2]
            )

        val diagonal2 =
            distance(
                corners[1],
                corners[3]
            )

        if (
            diagonal1 <= 0.0 ||
            diagonal2 <= 0.0 ||
            ratio(
                diagonal1,
                diagonal2
            ) > MAX_MARKER_DIAGONAL_RATIO
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: diagonal mismatch"
            )

            return null
        }

        // ========================================================
        // CONVEXITY
        // ========================================================

        if (
            !isConvexQuad(
                corners[0],
                corners[1],
                corners[2],
                corners[3]
            )
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: non-convex"
            )

            return null
        }

        // ========================================================
        // AREA
        // ========================================================

        val area =
            polygonArea(
                corners
            )

        if (
            area <= 1.0
        ) {
            return null
        }

        var minX =
            Double.POSITIVE_INFINITY

        var minY =
            Double.POSITIVE_INFINITY

        var maxX =
            Double.NEGATIVE_INFINITY

        var maxY =
            Double.NEGATIVE_INFINITY

        for (p in corners) {

            minX =
                min(
                    minX,
                    p.x
                )

            minY =
                min(
                    minY,
                    p.y
                )

            maxX =
                max(
                    maxX,
                    p.x
                )

            maxY =
                max(
                    maxY,
                    p.y
                )
        }

        val boxArea =
            (
                maxX - minX
            ) *
            (
                maxY - minY
            )

        if (
            boxArea <= 1.0
        ) {
            return null
        }

        val fillRatio =
            area / boxArea

        if (
            fillRatio <
            MIN_MARKER_FILL_RATIO
        ) {

            Log.w(
                TAG,
                "[SitReachCalibration] ID$id rejected: fillRatio=$fillRatio"
            )

            return null
        }

        Log.d(
            TAG,
            "[SitReachCalibration] ID$id marker geometry accepted edge=${average.toInt()}px"
        )

        return ValidatedMarker(
            id = id,
            center = copyPoint(center),
            bounds = bounds,
            averageEdge = average,
            area = area
        )
    }

    // ============================================================
    // CURRENT RESULT
    // ============================================================

    private fun currentResult(
        reason: String? = null
    ): CalibrationResult {

        val usableCalibration =
            calibrationLocked &&
            lockedHomography != null

        return CalibrationResult(

            // ----------------------------------------------------
            // IMPORTANT:
            // These are LIVE marker coordinates.
            //
            // Once markers disappear they become null even though
            // the calibration remains locked.
            // ----------------------------------------------------

            id1 =
                if (markersVisible) {
                    prevM1?.let {
                        MarkerPoint(
                            it.x,
                            it.y
                        )
                    }
                } else {
                    null
                },

            id2 =
                if (markersVisible) {
                    prevM2?.let {
                        MarkerPoint(
                            it.x,
                            it.y
                        )
                    }
                } else {
                    null
                },

            id3 =
                if (markersVisible) {
                    prevM3?.let {
                        MarkerPoint(
                            it.x,
                            it.y
                        )
                    }
                } else {
                    null
                },

            id4 =
                if (markersVisible) {
                    prevM4?.let {
                        MarkerPoint(
                            it.x,
                            it.y
                        )
                    }
                } else {
                    null
                },

            stabilityCount =
                stabilityCount,

            calibrationValid =
                usableCalibration,

            markersVisible =
                markersVisible,

            calibrationLocked =
                calibrationLocked,

            homography =
                if (usableCalibration) {
                    lockedHomography?.copyOf()
                } else {
                    null
                },

            failReason =
                if (usableCalibration) {
                    null
                } else {
                    reason ?: "Waiting for calibration"
                }
        )
    }

    // ============================================================
    // CLEAR ONLY LIVE MARKERS
    //
    // CRITICAL STEP-4 FUNCTION
    //
    // Marker loss must NOT destroy locked calibration.
    // ============================================================

    private fun clearOnlyLiveMarkers() {

        markersVisible =
            false

        prevM1 =
            null

        prevM2 =
            null

        prevM3 =
            null

        prevM4 =
            null

        // --------------------------------------------------------
        // If calibration has NOT yet locked, losing the markers
        // breaks the 5-frame stability sequence.
        // --------------------------------------------------------

        if (!calibrationLocked) {

            stabilityCount =
                0
        }

        // --------------------------------------------------------
        // DO NOT CLEAR:
        //
        // calibrationLocked
        // lockedHomography
        // lockedM1..lockedM4
        // --------------------------------------------------------
    }

    // ============================================================
    // CLEAR CURRENT ACQUISITION
    //
    // Used when calibration has not yet locked and the current
    // candidate geometry becomes invalid.
    // ============================================================

    private fun clearAcquisitionState() {

        if (calibrationLocked) {
            return
        }

        stabilityCount =
            0

        markersVisible =
            false

        prevM1 =
            null

        prevM2 =
            null

        prevM3 =
            null

        prevM4 =
            null
    }

    // ============================================================
    // REACT NATIVE OUTPUT
    // ============================================================

    @JvmStatic
    fun processAndPopulate(
        bitmap: Bitmap,
        calibMap: WritableMap
    ) {

        val result =
            process(bitmap)

        // --------------------------------------------------------
        // USABLE CALIBRATION
        // --------------------------------------------------------

        calibMap.putBoolean(
            "valid",
            result.calibrationValid
        )

        // --------------------------------------------------------
        // LOCK STATE
        // --------------------------------------------------------

        calibMap.putBoolean(
            "locked",
            result.calibrationLocked
        )

        // --------------------------------------------------------
        // LIVE VISIBILITY
        // --------------------------------------------------------

        calibMap.putBoolean(
            "markersVisible",
            result.markersVisible
        )

        // --------------------------------------------------------
        // STABILITY
        // --------------------------------------------------------

        calibMap.putString(
            "stability",
            "${result.stabilityCount}/$STABILITY_REQUIRED"
        )

        val bmpW =
            bitmap.width.toDouble()

        val bmpH =
            bitmap.height.toDouble()

        fun markerMap(
            point: MarkerPoint?
        ): WritableMap {

            val map =
                Arguments.createMap()

            map.putBoolean(
                "detected",
                point != null
            )

            if (point != null) {

                map.putDouble(
                    "x",
                    point.x / bmpW
                )

                map.putDouble(
                    "y",
                    point.y / bmpH
                )
            }

            return map
        }

        // --------------------------------------------------------
        // LIVE MARKERS ONLY
        // --------------------------------------------------------

        calibMap.putMap(
            "markerA",
            markerMap(result.id1)
        )

        calibMap.putMap(
            "markerB",
            markerMap(result.id2)
        )

        calibMap.putMap(
            "markerC",
            markerMap(result.id3)
        )

        calibMap.putMap(
            "markerD",
            markerMap(result.id4)
        )

        // --------------------------------------------------------
        // LOCKED HOMOGRAPHY
        // --------------------------------------------------------

        val h =
            result.homography

        if (
            result.calibrationValid &&
            result.calibrationLocked &&
            h != null
        ) {

            val array =
                Arguments.createArray()

            for (value in h) {

                array.pushDouble(
                    value
                )
            }

            calibMap.putArray(
                "homography",
                array
            )
        }

        // --------------------------------------------------------
        // STATUS / FAILURE
        // --------------------------------------------------------

        if (
            result.failReason != null
        ) {

            calibMap.putString(
                "failReason",
                result.failReason
            )
        }
    }

    // ============================================================
    // OPTIONAL GETTERS
    //
    // These will be useful in the next measurement steps.
    // ============================================================

    @JvmStatic
    fun isCalibrationLocked(): Boolean {

        return calibrationLocked &&
            lockedHomography != null
    }

    @JvmStatic
    fun getLockedHomography(): DoubleArray? {

        return lockedHomography?.copyOf()
    }

    // ============================================================
    // GEOMETRY HELPERS
    // ============================================================

    private fun distance(
        a: Point2D_F64,
        b: Point2D_F64
    ): Double {

        val dx =
            a.x - b.x

        val dy =
            a.y - b.y

        return sqrt(
            dx * dx +
            dy * dy
        )
    }

    private fun ratio(
        a: Double,
        b: Double
    ): Double {

        val small =
            min(
                a,
                b
            )

        val large =
            max(
                a,
                b
            )

        if (
            small <= 0.000001
        ) {

            return Double.POSITIVE_INFINITY
        }

        return large / small
    }

    private fun copyPoint(
        p: Point2D_F64
    ): Point2D_F64 {

        return Point2D_F64(
            p.x,
            p.y
        )
    }

    private fun polygonArea(
        points: List<Point2D_F64>
    ): Double {

        if (
            points.size < 3
        ) {
            return 0.0
        }

        var sum =
            0.0

        for (i in points.indices) {

            val current =
                points[i]

            val next =
                points[
                    (i + 1) %
                    points.size
                ]

            sum +=
                current.x *
                next.y -
                next.x *
                current.y
        }

        return abs(sum) * 0.5
    }

    private fun cross(
        a: Point2D_F64,
        b: Point2D_F64,
        c: Point2D_F64
    ): Double {

        return (
            b.x - a.x
        ) * (
            c.y - b.y
        ) - (
            b.y - a.y
        ) * (
            c.x - b.x
        )
    }

    private fun isConvexQuad(
        a: Point2D_F64,
        b: Point2D_F64,
        c: Point2D_F64,
        d: Point2D_F64
    ): Boolean {

        val c1 =
            cross(
                a,
                b,
                c
            )

        val c2 =
            cross(
                b,
                c,
                d
            )

        val c3 =
            cross(
                c,
                d,
                a
            )

        val c4 =
            cross(
                d,
                a,
                b
            )

        val epsilon =
            1e-6

        if (
            abs(c1) < epsilon ||
            abs(c2) < epsilon ||
            abs(c3) < epsilon ||
            abs(c4) < epsilon
        ) {

            return false
        }

        val allPositive =
            c1 > 0 &&
            c2 > 0 &&
            c3 > 0 &&
            c4 > 0

        val allNegative =
            c1 < 0 &&
            c2 < 0 &&
            c3 < 0 &&
            c4 < 0

        return allPositive ||
            allNegative
    }

    // ============================================================
    // HOMOGRAPHY
    //
    // IMAGE PIXELS -> DEVELOPMENT REFERENCE COORDINATES
    //
    // NOTE:
    // MARKER_GRID_WIDTH_CM / MARKER_GRID_HEIGHT_CM are temporary development
    // coordinates until the real Sit & Reach ruler setup is
    // physically calibrated.
    // ============================================================

    private fun computeHomography(
        m1: Point2D_F64,
        m2: Point2D_F64,
        m3: Point2D_F64,
        m4: Point2D_F64
    ): DoubleArray? {

        val srcX =
            doubleArrayOf(
                m1.x,
                m2.x,
                m3.x,
                m4.x
            )

        val srcY =
            doubleArrayOf(
                m1.y,
                m2.y,
                m3.y,
                m4.y
            )

        val dstX =
            doubleArrayOf(
                0.0,
                MARKER_GRID_WIDTH_CM,
                0.0,
                MARKER_GRID_WIDTH_CM
            )

        val dstY =
            doubleArrayOf(
                0.0,
                0.0,
                MARKER_GRID_HEIGHT_CM,
                MARKER_GRID_HEIGHT_CM
            )

        val A =
            Array(8) {
                DoubleArray(8)
            }

        val b =
            DoubleArray(8)

        for (i in 0 until 4) {

            val x =
                srcX[i]

            val y =
                srcY[i]

            val X =
                dstX[i]

            val Y =
                dstY[i]

            A[2 * i] =
                doubleArrayOf(
                    x,
                    y,
                    1.0,
                    0.0,
                    0.0,
                    0.0,
                    -x * X,
                    -y * X
                )

            A[2 * i + 1] =
                doubleArrayOf(
                    0.0,
                    0.0,
                    0.0,
                    x,
                    y,
                    1.0,
                    -x * Y,
                    -y * Y
                )

            b[2 * i] =
                X

            b[2 * i + 1] =
                Y
        }

        val h8 =
            gaussianElimination(
                A,
                b
            ) ?: return null

        return doubleArrayOf(
            h8[0],
            h8[1],
            h8[2],
            h8[3],
            h8[4],
            h8[5],
            h8[6],
            h8[7],
            1.0
        )
    }

    // ============================================================
    // GAUSSIAN ELIMINATION
    // ============================================================

    private fun gaussianElimination(
        A: Array<DoubleArray>,
        b: DoubleArray
    ): DoubleArray? {

        val n =
            b.size

        for (i in 0 until n) {

            var maxRow =
                i

            for (j in i + 1 until n) {

                if (
                    abs(A[j][i]) >
                    abs(A[maxRow][i])
                ) {

                    maxRow =
                        j
                }
            }

            val tmpA =
                A[i]

            A[i] =
                A[maxRow]

            A[maxRow] =
                tmpA

            val tmpB =
                b[i]

            b[i] =
                b[maxRow]

            b[maxRow] =
                tmpB

            if (
                abs(A[i][i]) <
                1e-10
            ) {

                return null
            }

            for (j in i + 1 until n) {

                val factor =
                    A[j][i] /
                    A[i][i]

                for (k in i until n) {

                    A[j][k] -=
                        factor *
                        A[i][k]
                }

                b[j] -=
                    factor *
                    b[i]
            }
        }

        val x =
            DoubleArray(n)

        for (i in n - 1 downTo 0) {

            var sum =
                0.0

            for (j in i + 1 until n) {

                sum +=
                    A[i][j] *
                    x[j]
            }

            x[i] =
                (
                    b[i] -
                    sum
                ) /
                A[i][i]
        }

        return x
    }

    // ============================================================
    // LOGGING
    // ============================================================

    private fun logPeriodically(
        m1: Point2D_F64,
        m2: Point2D_F64,
        m3: Point2D_F64,
        m4: Point2D_F64
    ) {

        val now =
            System.currentTimeMillis()

        if (
            now - lastLogMs <
            1000L
        ) {
            return
        }

        lastLogMs =
            now

        Log.d(
            TAG,
            "[SitReachCalibration] ID1 x=${m1.x.toInt()} y=${m1.y.toInt()}"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] ID2 x=${m2.x.toInt()} y=${m2.y.toInt()}"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] ID3 x=${m3.x.toInt()} y=${m3.y.toInt()}"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] ID4 x=${m4.x.toInt()} y=${m4.y.toInt()}"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] stability=$stabilityCount/$STABILITY_REQUIRED markersVisible=$markersVisible locked=$calibrationLocked"
        )
    }

    // ============================================================
    // FULL RESET / RECALIBRATE
    //
    // THIS IS THE ONLY NORMAL WAY TO REMOVE A LOCK.
    // ============================================================

    @JvmStatic
    fun reset() {

        Log.d(
            TAG,
            "[SitReachCalibration] ========================================"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] FULL RESET / RECALIBRATION REQUESTED"
        )

        Log.d(
            TAG,
            "[SitReachCalibration] ========================================"
        )

        stabilityCount =
            0

        markersVisible =
            false

        calibrationLocked =
            false

        lockedHomography =
            null

        lockedM1 =
            null

        lockedM2 =
            null

        lockedM3 =
            null

        lockedM4 =
            null

        prevM1 =
            null

        prevM2 =
            null

        prevM3 =
            null

        prevM4 =
            null

        lastDetectionMs =
            0L

        lastRawLogMs =
            0L

        lastLogMs =
            0L
    }
}