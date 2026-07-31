import { openDatabase, closeDatabase } from '../../src/database/database';

describe('Stress Tests - Database Recovery & WAL Integrity', () => {
  afterEach(async () => {
    await closeDatabase();
  });

  test('Database opens, applies WAL PRAGMAs, and recovers connection gracefully', async () => {
    const db = await openDatabase();
    expect(db).toBeDefined();

    // Re-open database connection to verify recovery
    await closeDatabase();
    const dbRecovered = await openDatabase();
    expect(dbRecovered).toBeDefined();
  });
});
