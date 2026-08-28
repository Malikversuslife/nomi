import { z } from "zod";
import { EXPLANATION_STYLE_VALUES } from "@/domain/profile/presentation";

export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  gradeYear: z
    .union([
      z.literal(""),
      z.string().trim().max(40, "Keep it to 40 characters or fewer."),
    ])
    .transform((value) => (value === "" ? null : value)),
  dailyGoalMinutes: z.coerce
    .number({ message: "Enter a number of minutes." })
    .int("Use a whole number of minutes.")
    .min(1, "Aim for at least 1 minute a day.")
    .max(240, "240 minutes a day is the maximum."),
  explanationStyle: z
    .union([
      z.literal(""),
      z.enum(EXPLANATION_STYLE_VALUES, {
        message: "Choose an explanation style.",
      }),
    ])
    .transform((value) => (value === "" ? null : value)),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

export type ProfileSettingsActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};