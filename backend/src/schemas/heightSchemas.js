import { z } from 'zod';

export const athleteUploadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  gender: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  heightCategory: z.string().nullable().optional(),
  coachName: z.string().nullable().optional(),
  schoolAcademy: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative().optional(),
});
