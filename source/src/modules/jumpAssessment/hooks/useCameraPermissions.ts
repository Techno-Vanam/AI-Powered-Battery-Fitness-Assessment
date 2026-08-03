/**
 * Hook to manage camera permissions using VisionCamera v5's native permission API.
 * VisionCamera v5 requires using its own permission system, NOT PermissionsAndroid.
 */

import { useCameraPermission } from 'react-native-vision-camera';

export { useCameraPermission as useCameraPermissions };
