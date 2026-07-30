import 'dotenv/config';
import { initialiseDB, closeDB } from './database/db.js';
import app from './app.js';
import env from './config/env.js';

// ── Initialise database before accepting connections ──────────────────────────
try {
  initialiseDB();
} catch (err) {
  console.error('[Fatal] Database initialisation failed:', err);
  process.exit(1);
}

// ── Start HTTP server ─────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log(`[Server] Running in ${env.NODE_ENV} mode`);
  console.log(`[Server] Listening on http://localhost:${env.PORT}`);
  console.log(`[Server] API base: http://localhost:${env.PORT}/api`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[Server] Received ${signal} — shutting down gracefully…`);
  server.close(() => {
    console.log('[Server] HTTP server closed');
    closeDB();
    process.exit(0);
  });

  // Force-exit if graceful shutdown stalls
  setTimeout(() => {
    console.error('[Server] Shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Safety nets ───────────────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught exception:', err);
  closeDB();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Fatal] Unhandled promise rejection:', reason);
  closeDB();
  process.exit(1);
});
