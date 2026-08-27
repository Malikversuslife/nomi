import { z } from "zod";
import type { TutorResponse } from "./types";

const forbiddenKeyPattern = /chain[_-]?of[_-]?thought|hidden[_-]?reasoning|reasoning/i;
const bannedSystemKeyPattern =
  /^(mastery|difficulty|intervention|lifecycle_status|status|topic_id|user_id|subject_id|concept_name|misconception)$/i;

function containsForbiddenKeys(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(containsForbiddenKeys);
  }

  return Object.entries(value).some(
    ([key, nested]) => forbiddenKeyPattern.test(key) || containsForbiddenKeys(nested),
  );
}

export const tutorResponseSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    follow_up: z.string().trim().min(1).max(400).optional(),
    suggested_action: z.enum(["practice", "review", "example", "none"]).default("none"),
  })
  .strict()
  .superRefine((value, context) => {
    if (containsForbiddenKeys(value)) {
      context.addIssue({ code: "custom", message: "Hidden reasoning fields are not allowed." });
    }

    for (const key of Object.keys(value)) {
      if (bannedSystemKeyPattern.test(key)) {
        context.addIssue({
          code: "custom",
          message: `Tutor output must not include the learner-system key "${key}".`,
        });
      }
    }
  });

export type TutorResponseOutput = z.infer<typeof tutorResponseSchema>;

export function toTutorResponse(output: TutorResponseOutput): TutorResponse {
  return {
    message: output.message,
    followUp: output.follow_up,
    suggestedAction: output.suggested_action,
  };
}