declare module 'react-native-fast-tflite' {
  export const useTensorflowModel: any;
}
declare module 'react-native-nitro-modules' {
  export const NitroModules: any;
}
declare module 'react-native-vision-camera' {
  export type Camera = any;
  export type CameraDevice = any;
  export type CameraDeviceFormat = any;
  export type Code = any;
  export const Camera: any;
  export const useCameraDevice: any;
  export const useCameraPermission: any;
  export const useCodeScanner: any;
  export const useFrameProcessor: any;
  export const VisionCameraProxy: any;
  export const useCameraFormat: any;
  export const useVideoOutput: any;
}
declare module 'react-native-worklets-core' {
  export const useRunOnJS: any;
}
declare module 'vision-camera-resize-plugin' {
  export const useResizePlugin: any;
}
declare module 'react-native-permissions' {
  export const check: any;
  export const request: any;
  export const openSettings: any;
  export const PERMISSIONS: any;
  export const RESULTS: any;
}
declare module 'react-native-image-picker' {
  export type Asset = any;
  export const launchImageLibrary: any;
  export const launchCamera: any;
}
declare module 'react-native-video' {
  export type VideoRef = any;
  const Video: any;
  export default Video;
}
declare module '@react-native-ml-kit/text-recognition' {
  const TextRecognition: any;
  export default TextRecognition;
}
declare module 'react-native-background-fetch' {
  const BackgroundFetch: any;
  export default BackgroundFetch;
}
declare module 'react-native-fs' {
  const RNFS: any;
  export default RNFS;
}
declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql: any;
    transaction: any;
    close: any;
  }
  export namespace SQLite {
    export type SQLiteDatabase = SQLiteDatabase;
  }
  const SQLite: {
    enablePromise: (enable: boolean) => void;
    openDatabase: any;
    [key: string]: any;
  };
  export default SQLite;
}
