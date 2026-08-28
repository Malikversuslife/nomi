"use client";

import { useActionState, useState } from "react";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { submitPracticeAttemptAction } from "@/server/practice/actions";
import type { PracticeActionState } from "@/server/practice/types";
import type { LearnerSafePracticeQuestionWithMeta } from "@/server/practice/questions";
import { Button, ButtonLink } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { AnswerOptions } from "./answer-options";
import { HintPanel } from "./hint-panel";
import { ErrorPanel } from "./error-panel";
import { PracticeFeedback } from "./practice-feedback";
import { PracticeHeader } from "./practice-header";
import { MathText } from "./math-text";
import {
  guidanceForResult,
  guidanceHeading,
  reactionForResult,
  type PracticeGuidance,
} from "./feedback";

function newSubmissionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PracticeSession({ initialState }: { initialState: PracticeActionState }) {
  const [state, formAction, isPending] = useActionState(
    submitPracticeAttemptAction,
    initialState,
  );
  const [question, setQuestion] = useState<LearnerSafePracticeQuestionWithMeta | null>(
    initialState.question ?? null,
  );
  const [selectedId, setSelectedId] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submissionKey, setSubmissionKey] = useState(() => newSubmissionKey());
  const [answeredCount, setAnsweredCount] = useState(0);
  const [submittedForQuestionId, setSubmittedForQuestionId] = useState<string | null>(null);
  const [persistedGuidance, setPersistedGuidance] = useState<PracticeGuidance | null>(null);

  const currentQuestionId = question?.id ?? null;
  const submitted =
    Boolean(state.result) && submittedForQuestionId === currentQuestionId && !isPending;
  const failed =
    Boolean(state.message) &&
    !state.result &&
    submittedForQuestionId === currentQuestionId &&
    !isPending;

  if (!question) {
    const wrappedUp = answeredCount > 0;
    return (
      <section className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-2 py-8 text-center">
        <NomiMascot state={wrappedUp ? "celebrating" : "curious"} size={56} />
        <h1 className="font-display text-2xl font-bold text-nomi-ink">
          {wrappedUp ? "Practice is all wrapped up." : "No practice questions right now."}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-nomi-muted">
          {wrappedUp
            ? "You've made it through today's practice session. Nomi will have more questions ready soon."
            : "Nomi doesn't have questions ready for this topic yet. Check back soon."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/home">Back to home</ButtonLink>
          <ButtonLink href="/learn" variant="secondary">
            Explore lessons
          </ButtonLink>
        </div>
      </section>
    );
  }

  const isMultipleChoice = question.questionType === "multiple_choice";
  const options = question.options ?? [];
  const hasSelection = isMultipleChoice ? selectedId !== "" : textAnswer.trim().length > 0;
  const interactive = !submitted && !failed && !isPending;
  const canSubmit = hasSelection && interactive;
  const revealCorrect = submitted && Boolean(state.result?.correct);

  function reaction() {
    if (isPending) {
      return "thinking" as const;
    }
    if (submitted && state.result) {
      return reactionForResult(state.result);
    }
    return "curious" as const;
  }

  function handleRetry() {
    if (state.result) {
      setPersistedGuidance(guidanceForResult(state.result));
    }
    setSubmittedForQuestionId(null);
    setSelectedId("");
    setSubmissionKey(newSubmissionKey());
  }

  function handleContinue() {
    const next = state.result?.nextQuestion ?? null;
    setQuestion(next);
    setSubmittedForQuestionId(null);
    setSelectedId("");
    setTextAnswer("");
    setPersistedGuidance(null);
    setSubmissionKey(newSubmissionKey());
    setAnsweredCount((count) => count + 1);
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <PracticeHeader conceptName={question.conceptName} reaction={reaction()} />

      <form
        action={formAction}
        className="space-y-6"
        onSubmit={() => setSubmittedForQuestionId(question.id)}
      >
        <input name="questionId" type="hidden" value={question.id} />
        <input name="questionType" type="hidden" value={question.questionType} />
        <input name="submissionKey" type="hidden" value={submissionKey} />

        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-nomi-ink sm:text-[1.7rem]">
            <MathText text={question.prompt} />
          </h2>

          {isMultipleChoice ? (
            <AnswerOptions
              interactive={interactive}
              onSelect={setSelectedId}
              options={options}
              revealCorrect={revealCorrect}
              selectedId={selectedId}
              submitted={submitted}
            />
          ) : (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-nomi-ink">Your answer</span>
              <input
                autoComplete="off"
                className={`min-h-12 w-full rounded-[var(--nomi-radius-medium)] border bg-nomi-surface px-4 text-sm text-nomi-ink placeholder:text-nomi-muted ${
                  submitted
                    ? state.result?.correct
                      ? "border-nomi-success-500"
                      : "border-nomi-error-500"
                    : "border-nomi-border focus:border-nomi-purple-500"
                }`}
                disabled={!interactive}
                name="learnerAnswer"
                onChange={(event) => setTextAnswer(event.target.value)}
                placeholder="Type your answer"
                type="text"
                value={textAnswer}
              />
            </label>
          )}

          {question.hint && (
            <HintPanel
              key={question.id}
              hint={question.hint}
              interactive={!submitted && !failed && !isPending}
            />
          )}

          {persistedGuidance && !submitted && (
            <FeedbackBanner variant="info" title={guidanceHeading[persistedGuidance.kind]}>
              <MathText text={persistedGuidance.text} />
            </FeedbackBanner>
          )}

          {!submitted && !failed && (
            <Button
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              type="submit"
            >
              {isPending ? "Checking…" : "Check answer"}
            </Button>
          )}
        </div>
      </form>

      {submitted && state.result && (
        <div className="mt-6">
          <PracticeFeedback
            onContinue={handleContinue}
            onRetry={handleRetry}
            result={state.result}
          />
        </div>
      )}

      {failed && (
        <div className="mt-6">
          <ErrorPanel onRetry={() => setSubmittedForQuestionId(null)} />
        </div>
      )}
    </div>
  );
}