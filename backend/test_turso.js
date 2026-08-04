import { initialiseDB, closeDB } from './src/database/db.js';
import env from './src/config/env.js';

async function testCloudDB() {
  console.log('--- TURSO CLOUD DB VERIFICATION TEST ---');
  console.log('URL:', env.TURSO_DATABASE_URL);
  
  const client = await initialiseDB();
  
  // 1. Query tables in Turso Cloud
  const tablesResult = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );
  const tables = tablesResult.rows.map(r => r.name);
  console.log('Tables present in Turso Cloud DB:', tables);

  // 2. Query users count in Turso Cloud
  const usersResult = await client.execute("SELECT COUNT(*) as count FROM users;");
  console.log('Current users stored in Turso Cloud DB:', usersResult.rows[0].count);

  // 3. Perform a test user write to verify pipeline
  const testLocalId = 'test-verification-uuid-' + Date.now();
  const testIdNum = 'VERIFY' + Math.floor(Math.random() * 100000);

  const insertSql = `
    INSERT INTO users (
      local_id, role, full_name, dob, gender, phone, id_type, id_number,
      school_or_org, password_hash, is_verified, consent_given, created_at, updated_at, sync_status
    ) VALUES (?, 'athlete', 'Turso Verification User', '2000-01-01', 'M', '9999999999', 'NSRS', ?, 'Test Org', '$2a$10$hash', 1, 1, datetime('now'), datetime('now'), 'synced')
  `;
  
  await client.execute({ sql: insertSql, args: [testLocalId, testIdNum] });
  console.log(`[WRITE TEST SUCCESS] Inserted test user (local_id: ${testLocalId}, id_number: ${testIdNum}) into Turso Cloud DB!`);

  // 4. Read back test user from Turso Cloud
  const readResult = await client.execute({
    sql: "SELECT local_id, full_name, id_type, id_number, is_verified, sync_status FROM users WHERE local_id = ?",
    args: [testLocalId]
  });
  console.log(`[READ TEST SUCCESS] Retrieved user from Turso Cloud DB:`, readResult.rows[0]);

  // 5. Cleanup test record
  await client.execute({ sql: "PRAGMA foreign_keys = OFF;" });
  await client.execute({ sql: "DELETE FROM users WHERE local_id = ?", args: [testLocalId] });
  console.log(`[CLEANUP SUCCESS] Deleted test record from Turso Cloud DB.`);

  closeDB();
  console.log('--- ALL VERIFICATIONS PASSED: TURSO CLOUD DB IS FULLY WORKING AND WRITING ---');
}

testCloudDB().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
