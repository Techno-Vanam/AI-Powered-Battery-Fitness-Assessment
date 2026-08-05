import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { athleteUploadSchema } from '../schemas/heightSchemas.js';
import {
  uploadAthlete,
  headAthlete,
  getAthlete,
  listAthleteHeightTests,
} from '../controllers/heightController.js';

const athleteRouter = Router();
athleteRouter.post('/', validate(athleteUploadSchema), uploadAthlete);
athleteRouter.head('/:id', headAthlete);
athleteRouter.get('/:id', getAthlete);
athleteRouter.get('/:id/height-tests', listAthleteHeightTests);

export { athleteRouter };
