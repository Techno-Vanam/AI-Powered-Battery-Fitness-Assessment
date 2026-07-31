import * as syncService from '../services/syncService.js';
import { sendSuccess } from '../utils/response.js';

export async function bulkSyncUsers(req, res, next) {
  try {
    const { users } = req.body;
    const result = await syncService.bulkSyncUsers(users);

    const message =
      `Sync complete. ` +
      `${result.synced} inserted, ${result.updated} updated, ` +
      `${result.conflicts} conflicts, ${result.failed} failed.`;

    return sendSuccess(res, message, result);
  } catch (err) {
    next(err);
  }
}
