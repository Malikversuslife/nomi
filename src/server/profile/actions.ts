"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";
import { createServerSupabaseClient } from "@/server/supabase/server";
import {
  profileSettingsSchema,
  type ProfileSettingsActionState,
} from "./schemas";

export async function updateProfileSettingsAction(
  _previousState: ProfileSettingsActionState,
  formData: FormData,
): Promise<ProfileSettingsActionState> {
  if (!hasSupabaseConfig()) {
    return { message: "Settings aren't available yet — Supabase isn't configured." };
  }

  const parsed = profileSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    gradeYear: formData.get("gradeYear"),
    dailyGoalMinutes: formData.get("dailyGoalMinutes"),
    explanationStyle: formData.get("explanationStyle"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      grade_year: parsed.data.gradeYear,
      daily_goal_minutes: parsed.data.dailyGoalMinutes,
      preferred_explanation_style: parsed.data.explanationStyle,
    })
    .eq("id", user.id);

  if (error) {
    return { message: "We couldn't save your changes. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return { success: true };
}