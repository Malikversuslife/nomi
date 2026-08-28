"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { SubjectIcon } from "@/components/ui/subject-icon";
import { SubjectVisual } from "@/components/ui/subject-visual";
import { subjectIdentityForName, subjectIdentityForIconKey } from "@/components/ui/subject-identity";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import type {
  OnboardingCompleteActionState,
  OnboardingExperienceData,
  OnboardingSubjectView,
} from "@/domain/onboarding/types";

type OnboardingCompleteAction = (
  prevState: OnboardingCompleteActionState,
  formData: FormData,
) => Promise<OnboardingCompleteActionState>;

export function OnboardingExperience({
  data,
  completeAction,
}: {
  data: OnboardingExperienceData;
  completeAction: OnboardingCompleteAction;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [completionState, formAction, isPending] = useActionState<
    OnboardingCompleteActionState,
    FormData
  >(completeAction, {});
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById("onboarding-heading")?.focus();
  }, [step]);

  const selectedSubject =
    data.subjects.find((subject) => subject.slug === selectedSlug) ?? null;

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <WelcomeStep displayName={data.displayName} onNext={() => setStep(2)} />
      ) : null}

      {step === 2 ? (
        <SubjectStep
          subjects={data.subjects}
          selectedSlug={selectedSlug}
          onSelect={(slug) => {
            setSelectedSlug(slug);
          }}
          onContinue={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      ) : null}

      {step === 3 && selectedSubject ? (
        <ReadyStep
          subject={selectedSubject}
          formRef={formRef}
          formAction={formAction}
          isPending={isPending}
          saveError={completionState.error ?? null}
          onBack={() => setStep(2)}
        />
      ) : null}
    </div>
  );
}

function ProgressCue({ current, total }: { current: number; total: number }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-muted">
      Step {current} of {total}
    </p>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button type="button" variant="secondary" onClick={onBack} aria-label="Go back">
      Back
    </Button>
  );
}

function WelcomeStep({
  displayName,
  onNext,
}: {
  displayName: string | null;
  onNext: () => void;
}) {
  return (
    <section className="text-center">
      <ProgressCue current={1} total={3} />
      <NomiMascot state="encouraging" size={72} className="mx-auto" />
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Your first lesson
      </p>
      <h1
        id="onboarding-heading"
        tabIndex={-1}
        className="mt-2 font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink"
      >
        Welcome to Nomi
      </h1>
      <p className="mt-3 text-nomi-muted">
        I&apos;ll help you practise at the right level and focus on what needs work.
      </p>
      {displayName ? (
        <p className="mt-1 text-sm text-nomi-muted">Hi, {displayName}.</p>
      ) : null}
      <Button type="button" className="mt-8 px-6" onClick={onNext}>
        Get started
      </Button>
    </section>
  );
}

function SubjectStep({
  subjects,
  selectedSlug,
  onSelect,
  onContinue,
  onBack,
}: {
  subjects: OnboardingSubjectView[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-md text-center">
      <ProgressCue current={2} total={3} />
      <NomiMascot state="curious" size={72} className="mx-auto" />
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Choose your path
      </p>
      <h1
        id="onboarding-heading"
        tabIndex={-1}
        className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-nomi-ink"
      >
        What do you want to work on first?
      </h1>
      <p className="mt-3 text-sm text-nomi-muted">
        You can explore other subjects anytime.
      </p>

      <div
        role="radiogroup"
        aria-label="Choose a subject"
        className="mt-6 grid gap-3 text-left sm:grid-cols-2"
      >
        {subjects.map((subject) => (
          <SubjectOption
            key={subject.slug}
            subject={subject}
            selected={subject.slug === selectedSlug}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <BackButton onBack={onBack} />
        <Button type="button" className="px-6" disabled={!selectedSlug} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </section>
  );
}

function SubjectOption({
  subject,
  selected,
  onSelect,
}: {
  subject: OnboardingSubjectView;
  selected: boolean;
  onSelect: (slug: string) => void;
}) {
  const identity = subjectIdentityForIconKey(subject.iconKey);

  return (
    <label
      className={`
        flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--nomi-radius-medium)] border p-4 transition-colors
        focus-within:outline-none focus-within:ring-2 focus-within:ring-nomi-purple-500 focus-within:ring-offset-2
        ${
          selected
            ? "border-nomi-purple-600 bg-nomi-purple-100/60 ring-1 ring-nomi-purple-600"
            : "border-nomi-border bg-nomi-surface hover:border-nomi-purple-500"
        }
      `}
    >
      <input
        type="radio"
        name="subject"
        value={subject.slug}
        checked={selected}
        onChange={() => onSelect(subject.slug)}
        className="sr-only"
      />
      <span aria-hidden="true" className="shrink-0" style={{ color: identity.color }}>
        <SubjectIcon iconKey={subject.iconKey} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-nomi-ink">{subject.name}</span>
        {subject.description ? (
          <span className="block text-sm text-nomi-muted">{subject.description}</span>
        ) : null}
      </span>
      {selected ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-nomi-purple-700">
          <AppIcon icon={CircleCheckIcon} size={15} strokeWidth={2.5} />
          Selected
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 rounded-full border border-nomi-border"
        />
      )}
    </label>
  );
}

function ReadyStep({
  subject,
  formRef,
  formAction,
  isPending,
  saveError,
  onBack,
}: {
  subject: OnboardingSubjectView;
  formRef: React.RefObject<HTMLFormElement | null>;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  saveError: string | null;
  onBack: () => void;
}) {
  const topic = subject.startingTopic;
  const identity = subjectIdentityForName(subject.name);

  return (
    <section className="mx-auto w-full max-w-md text-center">
      <ProgressCue current={3} total={3} />
      <NomiMascot state="celebrating" size={72} className="mx-auto" />
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Ready to go
      </p>
      <h1
        id="onboarding-heading"
        tabIndex={-1}
        className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-nomi-ink"
      >
        Let&apos;s start with {subject.name}.
      </h1>
      <p className="mt-3 text-sm text-nomi-muted">
        You&apos;re all set. Here&apos;s where you&apos;ll begin.
      </p>

      {topic ? (
        <div
          className="mt-6 flex items-start gap-4 rounded-[var(--nomi-radius-large)] p-4 text-left"
          style={{ backgroundColor: identity.soft }}
        >
          <SubjectVisual
            subject={subject.name}
            size="sm"
            className="hidden shrink-0 sm:block"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-muted">
              Starting point
            </p>
            <ol className="mt-2 list-none space-y-0.5 text-sm text-nomi-ink">
              <li>{topic.unitName}</li>
              {topic.groupName ? <li>{topic.groupName}</li> : null}
              <li className="font-semibold" style={{ color: identity.color }}>
                {topic.topicName}
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-nomi-muted">
          We&apos;ll get you started with {subject.name} anyway.
        </p>
      )}

      <form ref={formRef} action={formAction} className="mt-6">
        <input type="hidden" name="subjectSlug" value={subject.slug} readOnly />

        {saveError ? (
          <div className="text-left">
            <FeedbackBanner
              variant="error"
              title={saveError}
              action={
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => formRef.current?.requestSubmit()}
                >
                  Try again
                </Button>
              }
            />
          </div>
        ) : null}

        <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            type="submit"
            name="destination"
            value="practice"
            disabled={isPending}
            className="px-6"
          >
            Start practising
          </Button>
          <Button
            type="submit"
            name="destination"
            value="learn"
            variant="secondary"
            disabled={isPending}
            className="px-6"
          >
            Explore the subject
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <BackButton onBack={onBack} />
      </div>
    </section>
  );
}