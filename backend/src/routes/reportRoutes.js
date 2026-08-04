import { Router } from 'express';
import { downloadAthleteReport } from '../controllers/reportController.js';

const router = Router();

/**
 * GET /report/:athleteId
 * Public endpoint — no auth required.
 * Scanned from the QR code on the printed report card.
 * Responds with a PDF attachment that auto-downloads on any mobile browser.
 *
 * Query params:
 *   assessmentId  (optional) — echoed into the PDF header
 */
router.get('/:athleteId', downloadAthleteReport);

export default router;
