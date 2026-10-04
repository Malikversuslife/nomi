"use server";

import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/server/env";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { resolvePostAuthDestination } from "@/server/onboarding/status";
import { getAuthCallbackUrl, sanitizeNextPath } from "./redirects";
import { recoverySchema, signInSchema, signUpSchema, updatePasswordSchema, type AuthFormState } from "./schemas";

export async function signInAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!hasSupabaseConfig()) {
    return { message: "Supabase environment variables are not configured." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const requestedDestination = sanitizeNextPath(formData.get("next"));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: error.message };
  }

  if (!data.user) {
    return { message: "Unable to sign in." };
  }

  redirect(requestedDestination === "/home" ? await resolvePostAuthDestination(data.user.id) : requestedDestination);
}

export async function signUpAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!hasSupabaseConfig()) {
    return { message: "Supabase environment variables are not configured." };
  }

  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const requestedDestination = sanitizeNextPath(formData.get("next"), "/onboarding");

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(requestedDestination),
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    return { message: error.message };
  }

  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  if (!data.user) {
    return { message: "Unable to finish creating your account." };
  }

  redirect(requestedDestination);
}

export async function requestPasswordRecoveryAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!hasSupabaseConfig()) return { message: "Supabase environment variables are not configured." };
  const parsed = recoverySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthCallbackUrl("/auth/update-password"),
  });
  if (error) return { message: error.message };
  return { message: "If an account exists for that email, Nomi has sent a secure recovery link." };
}

export async function updatePasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!hasSupabaseConfig()) return { message: "Supabase environment variables are not configured." };
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "This recovery link is no longer valid. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: error.message };
  redirect(await resolvePostAuthDestination(user.id));
}

export async function signOutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/auth/sign-in");
}
