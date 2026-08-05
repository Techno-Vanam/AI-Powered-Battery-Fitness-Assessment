import 'dotenv/config';

function clean(value) {
  const v = (value ?? '').trim();
  if (!v) return '';
  // Ignore placeholders so local SQLite is used instead of a 404 Turso host
  if (/your-database|your_turso|YOUR-DB|YOUR_TOKEN|example\.turso/i.test(v)) return '';
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3010', 10),
  DB_PATH: process.env.DB_PATH ?? './data/sports.db',
  TURSO_DATABASE_URL: clean(process.env.TURSO_DATABASE_URL),
  TURSO_AUTH_TOKEN: clean(process.env.TURSO_AUTH_TOKEN),
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
    .split(',')
    .map((o) => o.trim()),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
};

export default env;
