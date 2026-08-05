import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { heightTestUploadSchema } from '../schemas/heightTestSchemas.js';
import {
  uploadHeightTest,
  headHeightTest,
  getHeightTest,
} from '../controllers/heightTestController.js';

const testRouter = Router();

testRouter.post('/height', validate(heightTestUploadSchema), uploadHeightTest);
testRouter.head('/height/:measurementId', headHeightTest);
testRouter.get('/height/:measurementId', getHeightTest);

export default testRouter;
