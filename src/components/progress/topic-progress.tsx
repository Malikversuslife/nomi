import Link from "next/link";
import type { LearnTopicStateKey } from "@/domain/learn/topic-state";
import { filterToProgressedTopics } from "@/domain/progress/presentation";
import type { TopicProgressView } from "@/domain/progress/types";

const badgeStyles: Record<LearnTopicStateKey, { container: string; dot: string }> = {
  "not-started": {
    container: "border border-nomi-border bg-nomi-surface text-nomi-muted",
    dot: "bg-nomi-border",
  },
  "in-progress": {
    container: "bg-nomi-purple-100 text-nomi-purple-700",
    dot: "bg-nomi-purple-500",
  },
  "needs-practice": {
    container: "bg-nomi-yellow-100 text-nomi-ink",
    dot: "bg-nomi-yellow-500",
  },
  strong: {
    container: "bg-nomi-mint-100 text-nomi-ink",
    dot: "bg-nomi-mint-500",
  },
};

function TopicStateBadge({ stateKey, label }: { stateKey: LearnTopicStateKey; label: string }) {
  const styles = badgeStyles[stateKey];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--nomi-radius-pill)] px-2 py-0.5 text-[11px] font-semibold ${styles.container}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}

function TopicRow({ topic }: { topic: TopicProgressView }) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white/70 p-3 sm:p-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-nomi-ink">{topic.name}</span>
          <TopicStateBadge stateKey={topic.state.key} label={topic.state.label} />
        </div>
        {topic.parentName || topic.subjectName ? (
          <p className="mt-0.5 text-xs text-nomi-muted">
            {topic.parentName ? `${topic.parentName} · ` : ""}
            {topic.subjectName}
          </p>
        ) : null}
        {topic.state.cue ? (
          <p className="mt-1 text-xs leading-relaxed text-nomi-muted">{topic.state.cue}</p>
        ) : null}
      </div>
      <Link
        href="/practice"
        aria-label={`${topic.state.actionLabel} ${topic.name}`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-4 text-sm font-semibold text-nomi-ink transition-colors hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        {topic.state.actionLabel}
      </Link>
    </li>
  );
}

export function TopicProgress({ topics }: { topics: TopicProgressView[] }) {
  const progressed = filterToProgressedTopics(topics);

  return (
    <section aria-labelledby="progress-topics-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Your practice
      </p>
      <h2
        id="progress-topics-heading"
        className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
      >
        What you&apos;re working on
      </h2>

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