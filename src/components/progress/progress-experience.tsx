import type { ProgressExperienceData } from "@/domain/progress/types";
import { NextUp } from "./next-up";
import { ProgressEmptyState } from "./progress-empty-state";
import { ProgressOverview } from "./progress-overview";
import { RecentLearning } from "./recent-learning";
import { SubjectProgress } from "./subject-progress";
import { TopicProgress } from "./topic-progress";

export function ProgressExperience({ data }: { data: ProgressExperienceData }) {
  const header = (
    <header>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">
        Your progress
      </p>
      <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink">
        See how you&apos;re growing
      </h1>
      <p className="mt-2 text-nomi-muted">
        Track what you&apos;ve been practising and see where to focus next.
      </p>
    </header>
  );

  if (!data.hasCurriculum) {
    return (
      <div className="space-y-6">
        {header}
        <section className="mx-auto max-w-[640px] rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 text-center shadow-sm">
          <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
            Learning content isn&apos;t ready yet
          </h2>
          <p className="mt-2 text-sm text-nomi-muted">
            Your progress will appear here as soon as topics become available.
          </p>
        </section>
        {data.recentLearning.length > 0 ? (
          <RecentLearning items={data.recentLearning} />
        ) : null}
      </div>
    );
  }

  if (!data.hasEvidence) {
    return (
      <div className="space-y-6">
        {header}
        <ProgressEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {data.overview ? <ProgressOverview overview={data.overview} /> : null}

      <SubjectProgress subjects={data.subjects} />

      <TopicProgress topics={data.topics} />

      {data.nextUp ? <NextUp view={data.nextUp} /> : null}

      {data.recentLearning.length > 0 ? (
        <RecentLearning items={data.recentLearning} />
      ) : null}
    </div>
  );
}