import { Platform } from 'react-native';

/**
 * Server host config:
 * - '10.0.2.2' for Android Emulator (maps to host localhost)
 * - '172.17.11.217' for physical Android devices on local Wi-Fi network
 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${DEV_HOST}:3000/api`;

