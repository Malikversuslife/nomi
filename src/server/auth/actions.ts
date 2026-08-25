"use server";

import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/server/env";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { signInSchema, signUpSchema, type AuthFormState } from "./schemas";

export async function signInAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!hasSupabaseConfig()) {
    return { message: "Supabase environment variables are not configured." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: error.message };
  }

  redirect("/home");
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

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
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

  redirect("/home");
}

export async function signOutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/auth/sign-in");
}
