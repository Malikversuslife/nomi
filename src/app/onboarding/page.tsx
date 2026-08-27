import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";
import { buildOnboardingExperience } from "@/server/onboarding/presentation";
import { getOnboardingStatus } from "@/server/onboarding/status";
import { completeOnboardingAction } from "@/server/onboarding/actions";
import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { OnboardingExperience } from "@/components/onboarding/onboarding-experience";

export default async function OnboardingPage() {
  if (!hasSupabaseConfig()) {
    return (
      <OnboardingShell>
        <ConfigurationNotice />
      </OnboardingShell>
    );
  }

  const user = await requireUser();
  const status = await getOnboardingStatus(user.id);

  if (status === "complete") {
    redirect("/home");
  }

  const experience = await buildOnboardingExperience(user.id);

  if (experience.subjects.length === 0) {
    return (
      <OnboardingShell>
        <section className="mx-auto max-w-[640px] rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">
            Welcome to Nomi
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-nomi-ink">
            Learning content isn&apos;t ready yet
          </h1>
          <p className="mt-2 text-sm text-nomi-muted">
            Subjects will appear here as they become available. You can still explore the app.
          </p>
        </section>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <OnboardingExperience data={experience} completeAction={completeOnboardingAction} />
    </OnboardingShell>
  );
}