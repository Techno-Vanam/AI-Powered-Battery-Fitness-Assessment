import { Platform } from 'react-native';

/** Android emulator maps host machine localhost to 10.0.2.2 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api`
  : 'https://your-production-api.com/api';

/**
 * ─── REPORT DOWNLOAD BASE URL ─────────────────────────────────────────────────
 * This is the public URL used to generate the QR code on every report card.
 * When scanned, it triggers an automatic PDF download on any mobile device.
 *
 * ✅ Same LAN (default):  Use your machine's LAN IP  e.g. http://172.17.10.194:3000/api
 * ✅ Different WiFi / Internet: Paste your ngrok HTTPS URL below:
 *       1. Open a NEW terminal
 *       2. Run:  ngrok http 3000
 *       3. Copy the "Forwarding" URL (e.g. https://a1b2-3c4d.ngrok-free.app)
 *       4. Set REPORT_BASE_URL = 'https://a1b2-3c4d.ngrok-free.app/api'
 *       5. Restart the React Native app — every QR code updates automatically
 *
 * ✅ Production / Cloud:  Set to your deployed backend URL
 */
export const REPORT_BASE_URL =
  // ← PASTE YOUR NGROK URL HERE (replace the line below):
  'http://172.17.10.194:3000/api';
  // Example: 'https://a1b2-3c4d.ngrok-free.app/api';
  // Production: 'https://api.batteryfitness.ai/api';
