import { z } from 'zod';

export const heightTestUploadSchema = z.object({
  measurementId: z.string().uuid(),
  athleteId: z.string().min(1),
  teamId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  heightCm: z.number().positive(),
  confidence: z.number().min(0).max(100),
  deviceModel: z.string().min(1),
  timestamp: z.number().int().nonnegative(),
  calibrationMethod: z.string().min(1),
});
