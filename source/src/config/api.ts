import { Platform } from 'react-native';

/** Android emulator maps host machine localhost to 10.0.2.2 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api`
  : 'https://your-production-api.com/api';
