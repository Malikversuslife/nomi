import "server-only";
import { createServerSupabaseClient } from "@/server/supabase/server";
import type { Profile } from "@/server/supabase/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  return data;
}

export async function getLearnerSubjects(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("learner_subjects")
    .select("*, subjects(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load learner subjects: ${error.message}`);
  }

  return data;
}

export async function getTopicProgress(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("topic_progress")
    .select("*, topics(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load topic progress: ${error.message}`);
  }

  return data;
}
