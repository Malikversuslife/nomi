import "server-only";
import { hasSupabaseConfig } from "@/server/env";
import { createServerSupabaseClient } from "@/server/supabase/server";
import {
  deriveOnboardingStatus,
  resolvePostAuthRoute,
} from "@/domain/onboarding/first-run";
import type { OnboardingStatus, PostAuthRoute } from "@/domain/onboarding/types";

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  if (!hasSupabaseConfig()) {
    return "needs-onboarding";
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("learner_subjects")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to check onboarding status: ${error.message}`);
  }

  return deriveOnboardingStatus(data !== null);
}

/**
 * Post-auth destination. Falls back to `/onboarding` on unexpected errors so a
 * genuinely new learner is never stranded: the onboarding page re-checks
 * status server-side and self-heals to `/home` if the learner is actually set up.
 */
export async function resolvePostAuthDestination(userId: string): Promise<PostAuthRoute> {
  try {
    return resolvePostAuthRoute(await getOnboardingStatus(userId));
  } catch {
    return "/onboarding";
  }
}