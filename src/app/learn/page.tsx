import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { LearnExperience } from "@/components/learn/learn-experience";
import { hasSupabaseConfig } from "@/server/env";
import { buildLearnExperience } from "@/server/learn/presentation";
import { requireUser } from "@/server/supabase/auth";
import { getMobileCurriculum } from "@/server/data/mobile-curriculum";
import { addLearnerSubjectAction } from "@/server/learn/actions";

export default async function LearnPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Learn">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const [data, curriculum] = await Promise.all([buildLearnExperience(user.id), getMobileCurriculum(user.id)]);
  if (curriculum.currentTopic && curriculum.subject) {
    data.defaultSubjectSlug = curriculum.subject.slug;
    data.continueView = {
      kind: "continue",
      subjectName: curriculum.subject.name,
      parentName: curriculum.currentTopic.parentName,
      topicName: curriculum.currentTopic.name,
      topicSlug: curriculum.currentTopic.slug,
      topicId: curriculum.currentTopic.id,
      state: { key: curriculum.currentTopic.mastery > 0 ? "in-progress" : "not-started", label: `${curriculum.currentTopic.mastery}/100 mastery`, cue: null, actionLabel: "Practise" },
    };
    if (data.insightView?.topicName !== curriculum.currentTopic.name) data.insightView = null;
  }

  if (data.subjects.length === 0) {
    return (
      <FoundationShell active="Learn">
        <section className="mx-auto max-w-[640px] rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">
            Learn
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-nomi-ink">
            Learning content isn&apos;t ready yet
          </h1>
          <p className="mt-2 text-sm text-nomi-muted">
            Subjects will appear here as they become available.
          </p>
        </section>
      </FoundationShell>
    );
  }

  return (
    <FoundationShell active="Learn">
      <LearnExperience data={data} addSubjectAction={addLearnerSubjectAction} mobilePath={curriculum.subject ? { subjectName: curriculum.subject.name, currentTopic: curriculum.currentTopic, topics: curriculum.topics } : undefined} />
    </FoundationShell>
  );
}
