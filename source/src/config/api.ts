/**
 * Dev API host.
 * Physical device (USB): use localhost + `adb reverse tcp:3010 tcp:3010`
 * (Port 3000 is often reserved by Windows Hyper-V.)
 */
const DEV_HOST = 'localhost';
const DEV_PORT = 3010;

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:${DEV_PORT}/api`
  : 'https://your-production-api.com/api';
