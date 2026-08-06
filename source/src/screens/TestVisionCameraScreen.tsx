import React, {
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useFrameProcessor,
} from 'react-native-vision-camera';

import {
    useRunOnJS,
} from 'react-native-worklets-core';


export default function TestVisionCameraScreen() {

    /*
     * =====================================================
     * CAMERA DEVICE
     * =====================================================
     */

    const device = useCameraDevice('back');


    /*
     * =====================================================
     * CAMERA PERMISSION
     * =====================================================
     */

    const {
        hasPermission,
        requestPermission,
    } = useCameraPermission();


    /*
     * =====================================================
     * STATES
     * =====================================================
     */

    const [
        cameraInitialized,
        setCameraInitialized,
    ] = useState(false);


    const [
        cameraError,
        setCameraError,
    ] = useState<string | null>(null);


    /*
     * Counts callbacks received from the
     * VisionCamera Frame Processor.
     *
     * This is only a diagnostic test.
     *
     * MoveNet is NOT connected yet.
     */
    const [
        frameCount,
        setFrameCount,
    ] = useState(0);


    /*
     * =====================================================
     * REQUEST CAMERA PERMISSION
     * =====================================================
     */

    useEffect(() => {

        const checkPermission = async () => {

            try {

                console.log(
                    '[VisionCameraTest]',
                    'Current permission:',
                    hasPermission,
                );


                if (!hasPermission) {

                    console.log(
                        '[VisionCameraTest]',
                        'Requesting camera permission...',
                    );


                    const granted =
                        await requestPermission();


                    console.log(
                        '[VisionCameraTest]',
                        'Permission result:',
                        granted,
                    );

                }

            } catch (error) {

                console.error(
                    '[VisionCameraTest]',
                    'Permission error:',
                    error,
                );


                setCameraError(
                    'Unable to request camera permission.',
                );

            }

        };


        checkPermission();

    }, [
        hasPermission,
        requestPermission,
    ]);


    /*
     * =====================================================
     * LOG CAMERA DEVICE
     * =====================================================
     */

    useEffect(() => {

        if (device == null) {

            console.log(
                '[VisionCameraTest]',
                'Back camera device not available yet.',
            );

            return;

        }


        console.log(
            '[VisionCameraTest]',
            'Back camera found:',
            device.name,
        );


        console.log(
            '[VisionCameraTest]',
            'Camera ID:',
            device.id,
        );

    }, [device]);


    /*
     * =====================================================
     * WORKLET -> REACT JS
     * =====================================================
     *
     * Frame processors execute in the Worklet runtime.
     *
     * React state must NOT be updated directly from
     * the Frame Processor.
     *
     * useRunOnJS creates a Worklet-safe function which
     * can return to the normal React JS thread.
     */

    const reportFrame = useRunOnJS(

        () => {

            setFrameCount(
                previous =>
                    previous + 1,
            );

        },

        [],

    );


    /*
     * =====================================================
     * VISION CAMERA FRAME PROCESSOR
     * =====================================================
     *
     * This does NOT run MoveNet yet.
     *
     * The purpose of this test is only:
     *
     * Physical Camera
     *       |
     *       v
     * VisionCamera
     *       |
     *       v
     * Frame Processor
     *       |
     *       v
     * React callback counter
     *
     * If frameCount increases, the Frame Processor
     * pipeline is working.
     */

    const frameProcessor =
        useFrameProcessor(

            (frame) => {

                'worklet';


                /*
                 * VisionCamera gives each frame
                 * a high-resolution timestamp.
                 */

                const timestamp =
                    frame.timestamp;


                /*
                 * Convert nanoseconds to milliseconds.
                 */

                const milliseconds =
                    timestamp / 1_000_000;


                /*
                 * Do NOT call React JS for every camera frame.
                 *
                 * We only report approximately every
                 * 500 milliseconds.
                 */

                if (
                    Math.floor(
                        milliseconds / 500,
                    )
                    !==
                    Math.floor(
                        (milliseconds - 33) / 500,
                    )
                ) {

                    reportFrame();

                }

            },

            [
                reportFrame,
            ],

        );


    /*
     * =====================================================
     * CAMERA ERROR SCREEN
     * =====================================================
     */

    if (cameraError) {

        return (

            <View style={styles.center}>

                <Text style={styles.errorTitle}>
                    CAMERA ERROR
                </Text>


                <Text style={styles.errorText}>
                    {cameraError}
                </Text>

            </View>

        );

    }


    /*
     * =====================================================
     * WAIT FOR CAMERA PERMISSION
     * =====================================================
     */

    if (!hasPermission) {

        return (

            <View style={styles.center}>

                <ActivityIndicator
                    size="large"
                    color="#ffffff"
                />


                <Text style={styles.text}>
                    Waiting for camera permission...
                </Text>

            </View>

        );

    }


    /*
     * =====================================================
     * WAIT FOR CAMERA DEVICE
     * =====================================================
     */

    if (device == null) {

        return (

            <View style={styles.center}>

                <ActivityIndicator
                    size="large"
                    color="#ffffff"
                />


                <Text style={styles.text}>
                    Finding back camera...
                </Text>

            </View>

        );

    }


    /*
     * =====================================================
     * CAMERA SCREEN
     * =====================================================
     */

    return (

        <View style={styles.container}>


            {/* ============================================
                VISION CAMERA
               ============================================ */}

            <Camera

                style={
                    StyleSheet.absoluteFill
                }

                device={device}

                isActive={true}

                photo={false}

                video={false}

                audio={false}


                /*
                 * Attach our diagnostic
                 * Frame Processor.
                 */
                frameProcessor={
                    frameProcessor
                }


                /*
                 * Called when VisionCamera has
                 * successfully initialized.
                 */
                onInitialized={() => {

                    console.log(
                        '[VisionCameraTest]',
                        'CAMERA INITIALIZED SUCCESSFULLY',
                    );


                    setCameraInitialized(
                        true,
                    );


                    setCameraError(
                        null,
                    );

                }}


                /*
                 * Camera runtime errors.
                 */
                onError={(error) => {

                    console.error(
                        '[VisionCameraTest]',
                        'CAMERA ERROR:',
                        error,
                    );


                    setCameraInitialized(
                        false,
                    );


                    setCameraError(
                        `${error.code}: ${error.message}`,
                    );

                }}

            />


            {/* ============================================
                DIAGNOSTIC INFORMATION
               ============================================ */}

            <View style={styles.status}>


                <Text style={styles.statusTitle}>

                    VISION CAMERA TEST

                </Text>


                <Text style={styles.statusText}>

                    Permission: YES

                </Text>


                <Text style={styles.statusText}>

                    Device: {device.name}

                </Text>


                <Text style={styles.statusText}>

                    Camera ID: {device.id}

                </Text>


                {/* CAMERA STATUS */}

                <Text
                    style={[
                        styles.statusText,

                        cameraInitialized
                            ? styles.successText
                            : styles.waitingText,
                    ]}
                >

                    Camera:{' '}

                    {cameraInitialized
                        ? 'INITIALIZED'
                        : 'STARTING...'}

                </Text>


                {/* FRAME PROCESSOR STATUS */}

                <Text
                    style={[
                        styles.statusText,

                        frameCount > 0
                            ? styles.successText
                            : styles.waitingText,
                    ]}
                >

                    Frame Processor:{' '}

                    {frameCount > 0
                        ? 'RUNNING'
                        : 'WAITING...'}

                </Text>


                {/* FRAME COUNTER */}

                <Text style={styles.frameText}>

                    Frame callbacks: {frameCount}

                </Text>


                {/* SUCCESS MESSAGE */}

                {frameCount > 0 && (

                    <Text
                        style={
                            styles.successMessage
                        }
                    >

                        Camera frames are reaching
                        the Frame Processor

                    </Text>

                )}


            </View>


            {/* ============================================
                CAMERA INITIALIZATION LOADING
               ============================================ */}

            {!cameraInitialized && (

                <View
                    style={
                        styles.loadingOverlay
                    }
                >

                    <ActivityIndicator
                        size="large"
                        color="#ffffff"
                    />


                    <Text
                        style={
                            styles.loadingText
                        }
                    >

                        Starting VisionCamera...

                    </Text>

                </View>

            )}


        </View>

    );

}


/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            backgroundColor: '#000',

        },


        center: {

            flex: 1,

            backgroundColor: '#000',

            justifyContent: 'center',

            alignItems: 'center',

            paddingHorizontal: 30,

        },


        text: {

            color: '#ffffff',

            fontSize: 16,

            marginTop: 15,

            textAlign: 'center',

        },


        errorTitle: {

            color: '#ff5555',

            fontSize: 22,

            fontWeight: '800',

            marginBottom: 15,

        },


        errorText: {

            color: '#ffffff',

            fontSize: 15,

            textAlign: 'center',

            lineHeight: 22,

        },


        /*
         * Diagnostic panel
         */

        status: {

            position: 'absolute',

            top: 40,

            left: 20,

            right: 20,

            backgroundColor:
                'rgba(0,0,0,0.72)',

            padding: 14,

            borderRadius: 10,

        },


        statusTitle: {

            color: '#ffffff',

            fontSize: 17,

            fontWeight: '800',

            marginBottom: 8,

        },


        statusText: {

            color: '#ffffff',

            fontSize: 13,

            marginBottom: 4,

        },


        successText: {

            color: '#7CFF8A',

            fontWeight: '800',

        },


        waitingText: {

            color: '#FFD166',

            fontWeight: '800',

        },


        frameText: {

            color: '#ffffff',

            fontSize: 15,

            fontWeight: '700',

            marginTop: 7,

        },


        successMessage: {

            color: '#7CFF8A',

            fontSize: 12,

            fontWeight: '700',

            marginTop: 7,

        },


        /*
         * Loading indicator
         */

        loadingOverlay: {

            position: 'absolute',

            left: 0,

            right: 0,

            bottom: 70,

            alignItems: 'center',

        },


        loadingText: {

            color: '#ffffff',

            fontSize: 14,

            marginTop: 10,

        },

    });