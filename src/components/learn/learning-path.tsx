import Link from "next/link";
import type { LearnSubjectView, LearnTopicRowView, LearnUnitView } from "@/domain/learn/types";
import type { LearnTopicStateKey } from "@/domain/learn/topic-state";

const badgeStyles: Record<
  LearnTopicStateKey,
  { container: string; dot: string }
> = {
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

function TopicRow({ topic }: { topic: LearnTopicRowView }) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white/70 p-3 sm:p-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-nomi-ink">{topic.name}</span>
          <TopicStateBadge stateKey={topic.state.key} label={topic.state.label} />
        </div>
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

function UnitSection({ unit }: { unit: LearnUnitView }) {
  const hasContent = unit.rows.length > 0 || unit.groups.length > 0;

  return (
    <section className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-4 shadow-sm sm:p-5">
      <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-nomi-ink">
        {unit.name}
      </h3>
      {unit.description ? (
        <p className="mt-1 text-sm text-nomi-muted">{unit.description}</p>
      ) : null}

      {unit.rows.length > 0 ? (
        <ol className="mt-3 space-y-2.5">
          {unit.rows.map((row) => (
            <TopicRow key={row.slug} topic={row} />
          ))}
        </ol>
      ) : null}

      {unit.groups.length > 0 ? (
        <div className="mt-4 space-y-4">
          {unit.groups.map((group) => (
            <div key={group.slug}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-nomi-purple-600">
                {group.name}
              </h4>
              <ol className="mt-2 space-y-2.5">
                {group.rows.map((row) => (
                  <TopicRow key={group.slug + row.slug} topic={row} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : null}

      {!hasContent ? (
        <p className="mt-2 text-sm text-nomi-muted">
          Topics for this unit aren&apos;t available yet.
        </p>
      ) : null}
    </section>
  );
}

export function LearningPath({ subject }: { subject: LearnSubjectView }) {
  if (subject.units.length === 0) {
    return (
      <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-nomi-ink">
          Topics for this subject aren&apos;t available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {subject.units.map((unit) => (
        <UnitSection key={unit.slug} unit={unit} />
      ))}
    </div>
  );
}