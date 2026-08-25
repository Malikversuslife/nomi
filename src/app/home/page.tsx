import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { SignOutButton } from "@/components/app-shell/sign-out-button";
import { TopicList } from "@/components/curriculum/topic-list";
import { hasSupabaseConfig } from "@/server/env";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { getLearnerSubjects, getProfile, getTopicProgress } from "@/server/data/learner";
import { requireUser } from "@/server/supabase/auth";

export default async function HomeRoutePage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Home"><ConfigurationNotice /></FoundationShell>;
  }

  const user = await requireUser();
  const [profile, subjects, learnerSubjects, topicProgress] = await Promise.all([
    getProfile(user.id),
    getSubjectsWithTopicHierarchy(),
    getLearnerSubjects(user.id),
    getTopicProgress(user.id),
  ]);

  return (
    <FoundationShell active="Home">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Protected Home</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Hi, {profile?.display_name ?? user.email}</h1>
        </div>
        <SignOutButton />
      </header>

      <section className="space-y-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm">
        <div>
          <h2 className="font-display text-2xl font-bold">Seeded curriculum</h2>
          <p className="text-sm text-nomi-muted">Read from canonical subject/topic IDs in Supabase.</p>
        </div>
        <div className="space-y-5">
          {subjects.map((subject) => (
            <article key={subject.id} className="rounded-[var(--nomi-radius-large)] bg-nomi-background p-4">
              <h3 className="font-display text-xl font-bold">{subject.name}</h3>
              <p className="mb-3 text-sm text-nomi-muted">{subject.description}</p>
              <TopicList topics={subject.topics} />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 text-sm text-nomi-muted shadow-sm">
        Learner subjects: {learnerSubjects.length}. Topic progress records: {topicProgress.length}. Adaptive calculations are not implemented in this milestone.
      </section>
    </FoundationShell>
  );
}
