import "server-only";
import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serviceRoleEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  NOMI_AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(8000),
  NOMI_AI_DISABLED: z.enum(["true", "false"]).default("false"),
  NOMI_QUESTION_TOKEN_SECRET: z.string().min(32).optional(),
});

export function hasSupabaseConfig() {
  return publicSupabaseEnvSchema.safeParse(process.env).success;
}

export function getSupabasePublicEnv() {
  return publicSupabaseEnvSchema.parse(process.env);
}

export function getSupabaseServiceRoleKey() {
  return serviceRoleEnvSchema.parse(process.env).SUPABASE_SERVICE_ROLE_KEY;
}

export function getAiEnv() {
  return aiEnvSchema.parse(process.env);
}

export function hasAiProviderConfig() {
  const env = getAiEnv();

  return env.NOMI_AI_DISABLED !== "true" && Boolean(env.OPENAI_API_KEY);
}

export function getQuestionTokenSecret() {
  return getAiEnv().NOMI_QUESTION_TOKEN_SECRET;
}
