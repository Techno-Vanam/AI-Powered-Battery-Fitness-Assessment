import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { bulkSyncSchema } from '../schemas/syncSchemas.js';
import { bulkSyncUsers } from '../controllers/syncController.js';

const router = Router();

// POST /api/sync/users
router.post('/users', validate(bulkSyncSchema), bulkSyncUsers);

export default router;
