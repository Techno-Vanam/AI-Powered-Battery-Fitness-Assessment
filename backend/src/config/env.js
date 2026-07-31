import 'dotenv/config';

const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  DB_PATH: process.env.DB_PATH ?? './data/sports.db',
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? '',
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? '',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
    .split(',')
    .map((o) => o.trim()),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
};

export default env;
