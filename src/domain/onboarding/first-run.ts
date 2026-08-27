import type { OnboardingStatus, PostAuthRoute } from "./types";

/**
 * First-run detection for learner onboarding.
 *
 * A learner is treated as set up once a `learner_subjects` row exists. Schema
 * constraints make this a defensible proxy for "has any learning setup or
 * progress": rows are only created by completing onboarding or by the first
 * practice submission, and both `topic_progress` and `practice_attempts`
 * foreign-key back to `learner_subjects`. A brand-new sign-up therefore has
 * exactly zero rows.
 */
export function deriveOnboardingStatus(hasLearnerSubject: boolean): OnboardingStatus {
  return hasLearnerSubject ? "complete" : "needs-onboarding";
}

export function resolvePostAuthRoute(status: OnboardingStatus): PostAuthRoute {
  return status === "needs-onboarding" ? "/onboarding" : "/home";
}