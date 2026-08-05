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

/**
 * Report download base URL for QR codes on coach report cards.
 * Override for ngrok/production as needed.
 */
export const REPORT_BASE_URL = __DEV__
  ? `http://172.17.10.194:${3010}/api`
  : 'https://your-production-api.com/api';

/**
 * Robust fetch wrapper that attempts candidate host addresses in DEV mode
 * so both emulators and physical devices (USB ADB or Wi-Fi) connect cleanly.
 */
export async function fetchApi(endpoint: string, init?: RequestInit): Promise<Response> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!__DEV__) {
    return fetch(`${API_BASE_URL}${path}`, init);
  }

  const candidateUrls = [
    `http://localhost:${DEV_PORT}/api${path}`,
    `http://10.0.2.2:${DEV_PORT}/api${path}`,
    `http://172.17.26.142:${DEV_PORT}/api${path}`,
  ];

  let lastErr: unknown = null;
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, init);
      return res;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error(`Failed to fetch from ${path}`);
}
