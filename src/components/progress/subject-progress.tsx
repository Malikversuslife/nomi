import { Atom, BookOpen, Calculator, FlaskConical, Leaf } from "lucide-react";
import type { ComponentType } from "react";
import type { SubjectProgressView } from "@/domain/progress/types";

type IconComponent = ComponentType<{ className?: string }>;

const subjectIcons: Record<string, IconComponent> = {
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  leaf: Leaf,
};

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
    segments.push({ id: "strong", dotClass: "bg-nomi-mint-500", text: `${subject.strong} strong` });
  }
  if (subject.needsPractice > 0) {
    segments.push({
      id: "needs-practice",
      dotClass: "bg-nomi-yellow-500",
      text: `${subject.needsPractice} ${subject.needsPractice === 1 ? "topic needs practice" : "topics need practice"}`,
    });
  }

  return segments;
}

function SubjectCard({ subject }: { subject: SubjectProgressView }) {
  const Icon = subjectIcons[subject.iconKey ?? ""] ?? BookOpen;
  const segments = subjectSummarySegments(subject);

  return (
    <li className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-white/70 p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nomi-purple-100 text-nomi-purple-700"
        >
          <Icon className="h-5 w-5" />
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Your subjects
      </p>
      <h2
        id="progress-subjects-heading"
        className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
      >
        Your subjects
      </h2>

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