import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { SubjectVisual } from "@/components/ui/subject-visual";
import { subjectIdentityForName } from "@/components/ui/subject-identity";
import type { LearnContinueView } from "@/domain/learn/types";

export function LearnContinueCard({ view }: { view: LearnContinueView }) {
  if (view.kind === "start") {
    return (
      <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
            You&apos;re ready to start.
          </h2>
          <p className="mt-1 max-w-md text-sm text-nomi-muted">
            Choose a topic and Nomi will begin adapting as you practise.
          </p>
        </div>
        <ButtonLink href="/practice" variant="secondary" className="shrink-0">
          Start practising
          <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
        </ButtonLink>
      </section>
    );
  }

  const identity = subjectIdentityForName(view.subjectName);

  return (
    <section
      className="relative overflow-hidden rounded-[var(--nomi-radius-feature)] px-5 py-6 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:px-8 sm:py-7"
      style={{ backgroundColor: identity.soft }}
    >
      <div className="relative z-10 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-ink/70">
          Continue learning
        </p>
        <p className="mt-1 text-sm font-medium text-nomi-muted">
          {view.parentName ? `${view.parentName} · ` : ""}
          {view.subjectName}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
          {view.topicName}
        </h2>
        <p className="mt-1 text-sm font-semibold text-nomi-ink">{view.state.label}</p>

        <ButtonLink href="/practice" className="mt-4">
          Continue practice
          <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
        </ButtonLink>
      </div>

      <div aria-hidden="true" className="hidden sm:block">
        <SubjectVisual subject={view.subjectName} size="lg" className="h-40 w-40 shrink-0" />
      </div>
    </section>
  );
}