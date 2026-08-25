import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { hasSupabaseConfig } from "@/server/env";
import { getTopicProgress } from "@/server/data/learner";
import { requireUser } from "@/server/supabase/auth";

export default async function ProgressPage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Progress"><ConfigurationNotice /></FoundationShell>;
  }

  const user = await requireUser();
  const topicProgress = await getTopicProgress(user.id);

  return (
    <FoundationShell active="Progress">
      <section className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Progress</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Learner-state records</h1>
        <p className="mt-3 text-nomi-muted">Topic progress rows available: {topicProgress.length}. Mastery calculations are intentionally not implemented yet.</p>
      </section>
    </FoundationShell>
  );
}
