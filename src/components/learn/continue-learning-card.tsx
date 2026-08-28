import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { SubjectVisual } from "@/components/ui/subject-visual";
import { subjectIdentityForName } from "@/components/ui/subject-identity";

export function ContinueLearningCard({
  subject,
  currentTopic,
  nextTopic,
}: {
  subject?: string;
  currentTopic?: string;
  nextTopic?: string;
}) {
  const hasData = Boolean(subject || currentTopic);

  if (!hasData) {
    return (
      <section className="mb-5 flex flex-col items-start gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-700">
            Start learning
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
            Where would you like to begin?
          </h2>
          <p className="mt-2 max-w-md text-sm text-nomi-muted">
            Pick a subject below and Nomi will meet you at the right level.
          </p>
        </div>
        <ButtonLink href="/learn" variant="secondary" className="shrink-0">
          Explore subjects
          <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
        </ButtonLink>
      </section>
    );
  }

  const identity = subjectIdentityForName(subject);

  return (
    <section
      className="relative mb-5 overflow-hidden rounded-[var(--nomi-radius-feature)] px-5 py-6 sm:mb-6 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:px-8 sm:py-8"
      style={{ backgroundColor: identity.soft }}
    >
      <div className="relative z-10 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-ink/70">
          Continue learning
        </p>
        <p className="mt-1 text-sm font-medium text-nomi-ink/70">
          {subject}
          {currentTopic ? ` · ${currentTopic}` : ""}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
          {currentTopic ?? subject}
        </h2>
        {nextTopic ? (
          <p className="mt-1 text-sm text-nomi-muted">Up next: {nextTopic}</p>
        ) : null}
        <ButtonLink href="/practice" className="mt-4">
          Continue practice
          <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
        </ButtonLink>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 hidden translate-y-4 sm:static sm:block sm:translate-y-0"
      >
        <SubjectVisual subject={subject} size="lg" className="h-44 w-44 shrink-0" />
      </div>
    </section>
  );
}