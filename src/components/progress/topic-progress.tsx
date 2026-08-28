import type { TopicProgressView } from "@/domain/progress/types";
import { filterToProgressedTopics } from "@/domain/progress/presentation";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge, topicStateTone } from "@/components/ui/status-badge";

function TopicRow({ topic }: { topic: TopicProgressView }) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--nomi-radius-medium)] bg-nomi-surface-subtle p-3.5 sm:p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-nomi-ink">{topic.name}</span>
          <StatusBadge tone={topicStateTone(topic.state.key)} label={topic.state.label} />
        </div>
        {topic.parentName || topic.subjectName ? (
          <p className="mt-0.5 text-xs text-nomi-muted">
            {topic.parentName ? `${topic.parentName} · ` : ""}
            {topic.subjectName ?? ""}
          </p>
        ) : null}
        {topic.state.cue ? (
          <p className="mt-1 text-xs leading-relaxed text-nomi-muted">{topic.state.cue}</p>
        ) : null}
      </div>
      <ButtonLink
        href="/practice"
        aria-label={`${topic.state.actionLabel} ${topic.name}`}
        variant="secondary"
        size="sm"
        className="shrink-0"
      >
        {topic.state.actionLabel}
      </ButtonLink>
    </li>
  );
}

export function TopicProgress({ topics }: { topics: TopicProgressView[] }) {
  const progressed = filterToProgressedTopics(topics);

  return (
    <section aria-labelledby="progress-topics-heading">
      <SectionHeader
        id="progress-topics-heading"
        eyebrow="Your practice"
        title="What you're working on"
        description="Topics you've started, ordered by what Nomi thinks you should practise next."
      />

      {progressed.length === 0 ? (
        <p className="mt-3 text-sm text-nomi-muted">
          You haven&apos;t started any topics yet. Practise a topic and it&apos;ll
          appear here.
        </p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {progressed.map((topic) => (
            <TopicRow key={topic.slug} topic={topic} />
          ))}
        </ol>
      )}
    </section>
  );
}