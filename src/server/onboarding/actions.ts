"use server";

import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/server/env";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { getCurrentUser } from "@/server/supabase/auth";
import { getSubjects } from "@/server/data/curriculum";
import { onboardingSubmissionSchema } from "@/domain/onboarding/schemas";
import type { OnboardingCompleteActionState } from "@/domain/onboarding/types";

const SAVE_ERROR = "We couldn't save that just now.";

export async function completeOnboardingAction(
  _previous: OnboardingCompleteActionState,
  formData: FormData,
): Promise<OnboardingCompleteActionState> {
  if (!hasSupabaseConfig()) {
    return { error: SAVE_ERROR };
  }

  const parsed = onboardingSubmissionSchema.safeParse({
    subjectSlug: formData.get("subjectSlug"),
    destination: formData.get("destination"),
  });

  if (!parsed.success) {
    return { error: SAVE_ERROR };
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const subjects = await getSubjects();
  const subject = subjects.find(
    (s) => s.slug === parsed.data.subjectSlug && s.active,
  );

  if (!subject) {
    return { error: SAVE_ERROR };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("learner_subjects").upsert(
    { user_id: user.id, subject_id: subject.id, status: "active" },
    { onConflict: "user_id,subject_id" },
  );

  if (error) {
    return { error: SAVE_ERROR };
  }

  redirect(parsed.data.destination === "learn" ? "/learn" : "/practice");
}