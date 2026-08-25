import "server-only";
import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serviceRoleEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
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
