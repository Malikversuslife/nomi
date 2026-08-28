import type { SubjectProgressView } from "@/domain/progress/types";
import { SectionHeader } from "@/components/ui/section-header";
import { SubjectIcon } from "@/components/ui/subject-icon";
import { subjectIdentityForIconKey } from "@/components/ui/subject-identity";

function subjectSummarySegments(subject: SubjectProgressView): {
  id: string;
  dotClass: string;
  text: string;
}[] {
  const segments: { id: string; dotClass: string; text: string }[] = [];

  if (subject.started > 0) {
    segments.push({
      id: "started",
      dotClass: "bg-nomi-purple-500",
      text: `${subject.started} ${subject.started === 1 ? "topic started" : "topics started"}`,
    });
  }
  if (subject.strong > 0) {
    segments.push({ id: "strong", dotClass: "bg-nomi-success-500", text: `${subject.strong} strong` });
  }
  if (subject.needsPractice > 0) {
    segments.push({
      id: "needs-practice",
      dotClass: "bg-nomi-warning-500",
      text: `${subject.needsPractice} ${subject.needsPractice === 1 ? "topic needs practice" : "topics need practice"}`,
    });
  }

  return segments;
}

function SubjectCard({ subject }: { subject: SubjectProgressView }) {
  const segments = subjectSummarySegments(subject);
  const identity = subjectIdentityForIconKey(subject.iconKey);

  return (
    <li
      className="rounded-[var(--nomi-radius-large)] p-4 sm:p-5"
      style={{ backgroundColor: identity.soft }}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nomi-surface/70"
          style={{ color: identity.color }}
        >
          <SubjectIcon iconKey={subject.iconKey} size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold tracking-[-0.01em] text-nomi-ink">
            {subject.name}
          </h3>
          <p className="text-xs text-nomi-muted">
            {subject.totalTopics > 0
              ? `${subject.totalTopics} ${subject.totalTopics === 1 ? "topic" : "topics"} available`
              : "Topics aren&apos;t available yet"}
          </p>
        </div>
      </div>

      {subject.totalTopics === 0 ? (
        <p className="mt-3 text-sm text-nomi-muted">
          Topics for this subject aren&apos;t available yet.
        </p>
      ) : subject.started === 0 ? (
        <p className="mt-3 text-sm font-medium text-nomi-ink">Not started yet</p>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium leading-relaxed text-nomi-ink">
          {segments.map((segment, index) => (
            <span key={segment.id} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${segment.dotClass}`} />
              <span>{segment.text}</span>
              {index < segments.length - 1 ? (
                <span aria-hidden="true" className="ml-2 text-nomi-border">·</span>
              ) : null}
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export function SubjectProgress({ subjects }: { subjects: SubjectProgressView[] }) {
  return (
    <section aria-labelledby="progress-subjects-heading">
      <SectionHeader id="progress-subjects-heading" title="Your subjects" />

      {subjects.length === 0 ? (
        <p className="mt-3 text-sm text-nomi-muted">
          Subjects will appear here as they become available.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </ul>
      )}
    </section>
  );
}