import type { LearnSubjectView, LearnTopicRowView, LearnUnitView } from "@/domain/learn/types";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge, topicStateTone } from "@/components/ui/status-badge";

function TopicRow({ topic }: { topic: LearnTopicRowView }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[var(--nomi-radius-medium)] bg-nomi-surface-subtle px-3.5 py-2.5">
      <span className="min-w-0 flex-1 text-sm font-semibold text-nomi-ink">{topic.name}</span>
      <StatusBadge tone={topicStateTone(topic.state.key)} label={topic.state.label} />
      {topic.state.cue ? (
        <p className="ml-auto basis-full text-xs leading-relaxed text-nomi-muted">{topic.state.cue}</p>
      ) : null}
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

function UnitSection({ unit }: { unit: LearnUnitView }) {
  const hasContent = unit.rows.length > 0 || unit.groups.length > 0;

  return (
    <section aria-label={unit.name}>
      <div className="border-b border-nomi-border pb-2">
        <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-nomi-ink">
          {unit.name}
        </h3>
        {unit.description ? (
          <p className="mt-0.5 text-sm text-nomi-muted">{unit.description}</p>
        ) : null}
      </div>

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
              <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-nomi-muted">
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
      <div className="py-6 text-center">
        <p className="text-sm font-semibold text-nomi-ink">
          Topics for this subject aren&apos;t available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      {subject.units.map((unit) => (
        <UnitSection key={unit.slug} unit={unit} />
      ))}
    </div>
  );
}