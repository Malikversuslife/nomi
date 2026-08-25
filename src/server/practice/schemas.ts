import { z } from "zod";

export const practiceSubmissionSchema = z.object({
  questionId: z.union([z.string().uuid(), z.string().regex(/^aiq\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)]),
  learnerAnswer: z.union([z.string().min(1), z.object({ option_id: z.string().min(1) }), z.object({ value: z.string().min(1) })]),
  learningSessionId: z.string().uuid().optional().nullable(),
  submissionKey: z.string().uuid(),
  responseTimeMs: z.coerce.number().int().min(0).max(60 * 60 * 1000).optional().nullable(),
});

export type PracticeSubmissionInput = z.infer<typeof practiceSubmissionSchema>;
