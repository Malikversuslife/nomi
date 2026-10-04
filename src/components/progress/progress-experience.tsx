import type { ProgressExperienceData } from "@/domain/progress/types";
import { NextUp } from "./next-up";
import { ProgressEmptyState } from "./progress-empty-state";
import { ProgressOverview } from "./progress-overview";
import { RecentLearning } from "./recent-learning";
import { SubjectProgress } from "./subject-progress";
import { TopicProgress } from "./topic-progress";

export function ProgressExperience({ data }: { data: ProgressExperienceData }) {
  const header = (
    <header className="max-w-3xl">
      <h1 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.05em] text-nomi-ink sm:text-[3.5rem]">
        See how you&apos;re growing
      </h1>
      <p className="mt-3 text-base leading-7 text-nomi-muted">
        Track what you&apos;ve been practising and see where to focus next.
      </p>
    </header>
  );

  if (!data.hasCurriculum) {
    return (
      <div className="space-y-6">
        {header}
        <section className="py-6 text-center">
          <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
            Learning content isn&apos;t ready yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-nomi-muted">
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
    <div className="mx-auto max-w-[900px] space-y-8">
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
