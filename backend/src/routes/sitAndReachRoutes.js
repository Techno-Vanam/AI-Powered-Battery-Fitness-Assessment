import { Router } from 'express';
import * as ctrl from '../controllers/sitAndReachController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/', auth, ctrl.createTest);
router.get('/athlete/:athleteId', auth, ctrl.getAthleteHistory);
router.get('/:id', auth, ctrl.getById);
router.post('/:id/correct', auth, ctrl.correctTest);
router.get('/session/:sessionDate', auth, ctrl.getBySessionDate);

export default router;
