import { z } from "zod";

export const onboardingSubmissionSchema = z.object({
  subjectSlug: z
    .string()
    .min(1, "A subject is required")
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Invalid subject"),
  destination: z.enum(["practice", "learn"]),
});

export type OnboardingSubmissionInput = z.infer<typeof onboardingSubmissionSchema>;