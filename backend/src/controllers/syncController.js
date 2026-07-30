import * as syncService from '../services/syncService.js';
import { sendSuccess } from '../utils/response.js';

// ── POST /api/sync/users ──────────────────────────────────────────────────────
export function bulkSyncUsers(req, res, next) {
  try {
    const { users } = req.body;
    const result = syncService.bulkSyncUsers(users);

    const message =
      `Sync complete. ` +
      `${result.synced} inserted, ${result.updated} updated, ` +
      `${result.conflicts} conflicts, ${result.failed} failed.`;

    return sendSuccess(res, message, result);
  } catch (err) {
    next(err);
  }
}
