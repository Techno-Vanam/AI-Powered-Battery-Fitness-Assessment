package com.sports

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Environment
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream
import kotlin.math.roundToInt

/**
 * SevenSegmentAnalyzerModule
 *
 * Native Android bridge that performs true seven-segment LCD digit detection
 * directly on bitmap pixel data using Android's built-in graphics APIs.
 *
 * Pipeline (analyzeSegments):
 * 1. Decode image URI → Bitmap
 * 2. Scale cropRect from screen-space → bitmap-space
 * 3. Crop the LCD display region
 * 4. Convert to grayscale (ITU-R BT.601 luminance formula)
 * 5. Adaptive threshold (local 8×8 tile grid — handles blue backlit LCDs)
 * 6. Find digit column boundaries (vertical density projection)
 * 7. Detect decimal point (small bright cluster below digit baseline)
 * 8. For each digit: sample 7 segment sub-regions → ON/OFF boolean states
 * 9. Return JSON result to JS
 *
 * Also exposes cropImageToTemp() so the ML Kit OCR fallback path receives a
 * properly-cropped LCD image instead of the full camera frame.
 *
 * No external dependencies — uses only android.graphics.* APIs.
 */
class SevenSegmentAnalyzerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SevenSegmentAnalyzer"

    // ─── Segment layout constants (normalized 0.0–1.0 within each digit box) ─────
    // Standard seven-segment layout:
    //  ─ a ─
    // b     c
    //  ─ d ─
    // e     f
    //  ─ g ─
    private val SEGMENT_REGIONS = mapOf(
        "a" to floatArrayOf(0.00f, 0.12f, 0.16f, 0.88f),  // Top horizontal
        "b" to floatArrayOf(0.08f, 0.00f, 0.46f, 0.22f),  // Top-left vertical
        "c" to floatArrayOf(0.08f, 0.78f, 0.46f, 1.00f),  // Top-right vertical
        "d" to floatArrayOf(0.42f, 0.12f, 0.58f, 0.88f),  // Middle horizontal
        "e" to floatArrayOf(0.54f, 0.00f, 0.92f, 0.22f),  // Bottom-left vertical
        "f" to floatArrayOf(0.54f, 0.78f, 0.92f, 1.00f),  // Bottom-right vertical
        "g" to floatArrayOf(0.84f, 0.12f, 1.00f, 0.88f)   // Bottom horizontal
    )

    // Segment is ON if ≥28% of its region area is bright pixels.
    // Lowered from 0.38 → works for blue-backlit LCDs where segment edges blend slightly.
    private val SEGMENT_ON_THRESHOLD = 0.28f

    // Minimum column width (px) to be considered a digit region
    private val MIN_DIGIT_WIDTH_PX = 4

    // Minimum gap (px) to separate two digit regions
    private val MIN_GAP_PX = 2

    // ─── analyzeSegments ────────────────────────────────────────────────────────

    @ReactMethod
    fun analyzeSegments(
        imageUri: String,
        cropRectMap: ReadableMap,
        screenWidth: Double,
        screenHeight: Double,
        promise: Promise
    ) {
        try {
            val croppedGray = loadAndPreprocess(imageUri, cropRectMap, screenWidth, screenHeight)
                ?: return promise.reject("DECODE_ERROR", "Failed to load/crop image: $imageUri")

            val (binary, width, height) = croppedGray

            // ── Step 6: Digit column segmentation ────────────────────────────
            val digitBounds = findDigitColumns(binary, width, height)

            // ── Step 7: Decimal point detection ──────────────────────────────
            val decimalAfterIndex = detectDecimalPoint(binary, width, height, digitBounds)

            // ── Step 8: Sample 7 segments per digit ──────────────────────────
            val digitsArray = WritableNativeArray()
            for ((startX, endX) in digitBounds) {
                digitsArray.pushMap(sampleSegments(binary, width, height, startX, endX))
            }

            val result = WritableNativeMap()
            result.putArray("digits", digitsArray)
            if (decimalAfterIndex != null) result.putInt("decimalAfterIndex", decimalAfterIndex)
            else result.putNull("decimalAfterIndex")
            result.putInt("digitCount", digitBounds.size)
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("SEGMENT_ANALYSIS_ERROR", "Seven-segment analysis failed: ${e.message}", e)
        }
    }

    // ─── cropImageToTemp ────────────────────────────────────────────────────────

    /**
     * Crops the LCD display region from the full camera frame and saves it as a
     * temporary JPEG file. The returned URI can be passed to ML Kit TextRecognition
     * so OCR runs on just the digit area instead of the whole camera frame.
     *
     * This eliminates the need for any third-party npm image-cropping package.
     */
    @ReactMethod
    fun cropImageToTemp(
        imageUri: String,
        cropRectMap: ReadableMap,
        screenWidth: Double,
        screenHeight: Double,
        promise: Promise
    ) {
        try {
            val cleanUri = imageUri.removePrefix("file://")
            val originalBitmap = loadOrientedBitmap(cleanUri)
                ?: return promise.reject("DECODE_ERROR", "Failed to decode: $imageUri")

            val (cropX, cropY, cropW, cropH) = scaleCropRect(
                cropRectMap, screenWidth, screenHeight,
                originalBitmap.width.toFloat(), originalBitmap.height.toFloat()
            )

            val cropped = Bitmap.createBitmap(originalBitmap, cropX, cropY, cropW, cropH)
            originalBitmap.recycle()

            // 2x Bilinear Upscale for OCR clarity
            val targetW = (cropW * 2).coerceAtMost(2400)
            val targetH = (cropH * 2).coerceAtMost(1200)
            val scaled = Bitmap.createScaledBitmap(cropped, targetW, targetH, true)
            if (scaled != cropped) cropped.recycle()

            // Save to cache dir
            val cacheDir = reactApplicationContext.cacheDir
            val tempFile = File(cacheDir, "lcd_crop_${System.currentTimeMillis()}.jpg")
            FileOutputStream(tempFile).use { out ->
                scaled.compress(Bitmap.CompressFormat.JPEG, 92, out)
            }
            scaled.recycle()

            promise.resolve("file://${tempFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("CROP_ERROR", "Crop failed: ${e.message}", e)
        }
    }

    // ─── Internal helpers ────────────────────────────────────────────────────────

    /**
     * Loads a bitmap and rotates it according to EXIF metadata.
     * Android camera JPEGs are saved in sensor orientation (e.g. 90 deg rotated) with EXIF tags.
     */
    private fun loadOrientedBitmap(filepath: String): Bitmap? {
        val bitmap = BitmapFactory.decodeFile(filepath) ?: return null
        return try {
            val exif = android.media.ExifInterface(filepath)
            val orientation = exif.getAttributeInt(
                android.media.ExifInterface.TAG_ORIENTATION,
                android.media.ExifInterface.ORIENTATION_NORMAL
            )
            val matrix = android.graphics.Matrix()
            when (orientation) {
                android.media.ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
                android.media.ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
                android.media.ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
                else -> return bitmap
            }
            val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            bitmap.recycle()
            rotated
        } catch (e: Exception) {
            bitmap
        }
    }

    /**
     * Loads, crops, upscales 2x, and binarizes the image.
     * Returns (binaryArray, width, height) or null on failure.
     */
    private fun loadAndPreprocess(
        imageUri: String,
        cropRectMap: ReadableMap,
        screenWidth: Double,
        screenHeight: Double
    ): Triple<IntArray, Int, Int>? {
        val cleanUri = imageUri.removePrefix("file://")
        val originalBitmap = loadOrientedBitmap(cleanUri) ?: return null

        val (cropX, cropY, cropW, cropH) = scaleCropRect(
            cropRectMap, screenWidth, screenHeight,
            originalBitmap.width.toFloat(), originalBitmap.height.toFloat()
        )

        val cropped = Bitmap.createBitmap(originalBitmap, cropX, cropY, cropW, cropH)
        originalBitmap.recycle()

        // 2x Bilinear Upscale
        val targetW = (cropW * 2).coerceAtMost(2400)
        val targetH = (cropH * 2).coerceAtMost(1200)
        val scaled = Bitmap.createScaledBitmap(cropped, targetW, targetH, true)
        if (scaled != cropped) cropped.recycle()

        val width = scaled.width
        val height = scaled.height

        // Grayscale (ITU-R BT.601)
        val gray = IntArray(width * height)
        for (y in 0 until height) {
            for (x in 0 until width) {
                val p = scaled.getPixel(x, y)
                gray[y * width + x] = (0.299 * Color.red(p) + 0.587 * Color.green(p) + 0.114 * Color.blue(p)).roundToInt()
            }
        }
        scaled.recycle()

        // Polarity auto-detection: Calculate overall mean luminance
        var totalGraySum = 0L
        for (v in gray) totalGraySum += v
        val overallMean = if (gray.isNotEmpty()) totalGraySum / gray.size else 128
        val isDarkSegmentsOnLightBg = overallMean > 120

        // Adaptive threshold: 8×8 tile grid
        val binary = IntArray(width * height)
        val tileW = (width / 8).coerceAtLeast(4)
        val tileH = (height / 8).coerceAtLeast(4)

        for (ty in 0 until height step tileH) {
            for (tx in 0 until width step tileW) {
                val x1 = tx; val x2 = (tx + tileW).coerceAtMost(width)
                val y1 = ty; val y2 = (ty + tileH).coerceAtMost(height)
                var sum = 0L; var count = 0
                for (py in y1 until y2) for (px in x1 until x2) { sum += gray[py * width + px]; count++ }
                val localMean = if (count > 0) (sum / count).toInt() else 128

                if (isDarkSegmentsOnLightBg) {
                    val threshold = (localMean * 0.88).toInt()
                    for (py in y1 until y2) for (px in x1 until x2) {
                        binary[py * width + px] = if (gray[py * width + px] < threshold) 255 else 0
                    }
                } else {
                    val threshold = (localMean * 0.75).toInt()
                    for (py in y1 until y2) for (px in x1 until x2) {
                        binary[py * width + px] = if (gray[py * width + px] > threshold) 255 else 0
                    }
                }
            }
        }

        return Triple(binary, width, height)
    }

    /**
     * Scales a screen-space cropRect to bitmap-space pixel coordinates using VisionCamera cover aspect ratio math.
     * Returns (cropX, cropY, cropW, cropH) clamped to bitmap bounds.
     */
    private fun scaleCropRect(
        cropRectMap: ReadableMap,
        screenWidth: Double,
        screenHeight: Double,
        bmpW: Float,
        bmpH: Float
    ): IntArray {
        val rectX = cropRectMap.getDouble("x").toFloat()
        val rectY = cropRectMap.getDouble("y").toFloat()
        val rectW = cropRectMap.getDouble("width").toFloat()
        val rectH = cropRectMap.getDouble("height").toFloat()

        val screenW = screenWidth.toFloat()
        val screenH = screenHeight.toFloat()

        // VisionCamera uses 'cover' resize mode by default.
        // Scale factor: max ratio to cover the screen container
        val scale = Math.max(bmpW / screenW, bmpH / screenH)

        // Physical dimensions of the visible screen area mapped onto bitmap
        val visibleW = screenW * scale
        val visibleH = screenH * scale

        // Offsets in bitmap coordinates due to centering (cover mode)
        val offsetX = (bmpW - visibleW) / 2f
        val offsetY = (bmpH - visibleH) / 2f

        val cropX = ((rectX * scale + offsetX).roundToInt()).coerceIn(0, bmpW.toInt() - 1)
        val cropY = ((rectY * scale + offsetY).roundToInt()).coerceIn(0, bmpH.toInt() - 1)
        val cropW = ((rectW * scale).roundToInt()).coerceIn(1, bmpW.toInt() - cropX)
        val cropH = ((rectH * scale).roundToInt()).coerceIn(1, bmpH.toInt() - cropY)

        return intArrayOf(cropX, cropY, cropW, cropH)
    }

    /**
     * Finds digit column boundaries using vertical brightness projection.
     * Lowered density threshold (8% of height) to detect thinner digit strokes.
     */
    private fun findDigitColumns(binary: IntArray, width: Int, height: Int): List<Pair<Int, Int>> {
        val colDensity = IntArray(width)
        for (x in 0 until width) {
            var bright = 0
            for (y in 0 until height) { if (binary[y * width + x] == 255) bright++ }
            colDensity[x] = bright
        }

        // 8% of height (was 15%) — detects thin strokes on small LCD displays
        val densityThreshold = (height * 0.08).roundToInt().coerceAtLeast(2)
        val digitBounds = mutableListOf<Pair<Int, Int>>()
        var inDigit = false
        var digitStart = 0
        var gapCount = 0

        for (x in 0 until width) {
            val isDense = colDensity[x] > densityThreshold
            if (isDense && !inDigit) {
                inDigit = true; digitStart = x; gapCount = 0
            } else if (!isDense && inDigit) {
                gapCount++
                if (gapCount >= MIN_GAP_PX) {
                    val digitEnd = x - gapCount
                    if (digitEnd - digitStart >= MIN_DIGIT_WIDTH_PX) {
                        digitBounds.add(Pair(digitStart, digitEnd))
                    }
                    inDigit = false; gapCount = 0
                }
            } else if (isDense && inDigit) {
                gapCount = 0
            }
        }
        if (inDigit && (width - 1 - digitStart) >= MIN_DIGIT_WIDTH_PX) {
            digitBounds.add(Pair(digitStart, width - 1))
        }

        return digitBounds
    }

    /**
     * Samples 7 segment sub-regions within a digit bounding box.
     * Returns a WritableMap of { a, b, c, d, e, f, g } booleans.
     */
    private fun sampleSegments(
        binary: IntArray, width: Int, height: Int,
        startX: Int, endX: Int
    ): WritableNativeMap {
        val digitMap = WritableNativeMap()
        val boxW = (endX - startX).coerceAtLeast(1)

        for ((segName, norm) in SEGMENT_REGIONS) {
            val sy = (norm[0] * height).roundToInt().coerceIn(0, height - 1)
            val sx = (norm[1] * boxW + startX).roundToInt().coerceIn(startX, endX)
            val ey = (norm[2] * height).roundToInt().coerceIn(0, height)
            val ex = (norm[3] * boxW + startX).roundToInt().coerceIn(startX, endX)

            val regionH = (ey - sy).coerceAtLeast(1)
            val regionW = (ex - sx).coerceAtLeast(1)
            var brightPixels = 0
            val totalPixels = regionW * regionH

            for (py in sy until sy + regionH) {
                for (px in sx until sx + regionW) {
                    if (px < width && py < height && binary[py * width + px] == 255) brightPixels++
                }
            }

            val brightness = brightPixels.toFloat() / totalPixels.toFloat()
            digitMap.putBoolean(segName, brightness > SEGMENT_ON_THRESHOLD)
        }
        return digitMap
    }

    /**
     * Detects a decimal point by scanning the bottom 30% of the binarized image
     * for a small isolated bright cluster between adjacent digit columns.
     */
    private fun detectDecimalPoint(
        binary: IntArray,
        width: Int,
        height: Int,
        digitBounds: List<Pair<Int, Int>>
    ): Int? {
        if (digitBounds.size < 2) return null
        val decimalZoneTop = (height * 0.70).roundToInt()
        val maxDecimalWidth = (width * 0.08).roundToInt().coerceAtLeast(4)

        for (i in 0 until digitBounds.size - 1) {
            val gapStart = digitBounds[i].second + 1
            val gapEnd = (digitBounds[i + 1].first - 1).coerceAtMost(width - 1)
            if (gapEnd - gapStart < 2) continue

            var brightInGap = 0; var totalInGap = 0
            for (y in decimalZoneTop until height) {
                for (x in gapStart..gapEnd) {
                    totalInGap++
                    if (binary[y * width + x] == 255) brightInGap++
                }
            }
            val gapWidth = gapEnd - gapStart
            val brightRatio = if (totalInGap > 0) brightInGap.toFloat() / totalInGap else 0f
            if (gapWidth <= maxDecimalWidth && brightRatio > 0.25f) return i
        }
        return null
    }
}
