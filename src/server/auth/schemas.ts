import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  displayName: z.string().min(2, "Use at least 2 characters.").max(80).trim(),
  email: z.string().email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
