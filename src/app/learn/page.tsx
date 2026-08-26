import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { TopicList } from "@/components/curriculum/topic-list";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";

export default async function LearnPage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Learn"><ConfigurationNotice /></FoundationShell>;
  }

  await requireUser();
  const subjects = await getSubjectsWithTopicHierarchy();

  return (
    <FoundationShell active="Learn">
      <section className="space-y-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Learn</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Your subjects</h1>
          <p className="mt-2 text-nomi-muted">Browse your learning path through subjects, units, and topics.</p>
        </div>

        {subjects.map((subject) => (
          <article
            key={subject.id}
            className="rounded-[var(--nomi-radius-large)] bg-nomi-background p-4 border-b"
          >
            <h2 className="font-display text-xl font-bold">{subject.name}</h2>
            <TopicList topics={subject.topics} />
          </article>
        ))}
      </section>
    </FoundationShell>
  );
}