import { z } from 'zod';

export const UserBanSchema = z.object({
  actionType: z.literal('ban'),
  reasonCode: z
    .string()
    .min(1, 'reasonCode is required')
    .max(100, 'reasonCode must be less than 100 characters'),
  reason: z
    .string()
    .max(1000, 'reason must be less than 1000 characters')
    .optional(),
  relatedReportId: z
    .number()
    .int('relatedReportId must be an integer')
    .positive('relatedReportId must be a positive integer')
    .optional(),
  expiresAt: z
    .string()
    .datetime('expiresAt must be a valid ISO datetime string')
    .optional(),
});

export type UserBanRequest = z.infer<typeof UserBanSchema>;
