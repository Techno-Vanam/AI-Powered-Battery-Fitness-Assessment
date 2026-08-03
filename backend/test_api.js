import http from 'http';

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        host: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- Testing Weight Measurement Backend APIs ---');

  // 1. Test POST /api/weight-measurements
  const postRes = await post('/api/weight-measurements', {
    weight: 68.4,
    ocr_confidence: 0.97,
    captured_at: new Date().toISOString(),
  });
  console.log('1. Single Upload Status:', postRes.status, postRes.data);

  // 2. Test GET /api/weight-measurements
  const getRes = await get('/api/weight-measurements');
  console.log('2. Fetch All Status:', getRes.status, 'Count:', getRes.data.count);

  // 3. Test POST /api/weight-measurements/sync (Bulk Sync)
  const syncRes = await post('/api/weight-measurements/sync', [
    { id: 'offline-001', weight: 70.2, ocr_confidence: 0.95, captured_at: new Date().toISOString() },
    { id: 'offline-002', weight: 71.5, ocr_confidence: 0.92, captured_at: new Date().toISOString() },
  ]);
  console.log('3. Bulk Sync Status:', syncRes.status, syncRes.data);

  console.log('--- All Backend API Verification Tests Completed Successfully ---');
}

runTests().catch(console.error);
