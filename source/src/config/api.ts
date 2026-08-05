export const API_BASE_URL = __DEV__
  ? `http://localhost:3000/api`
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
    `http://localhost:3000/api${path}`,
    `http://10.0.2.2:3000/api${path}`,
    `http://172.17.26.142:3000/api${path}`,
  ];

  let lastErr: any = null;
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
