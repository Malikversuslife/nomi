"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { submitPracticeAttemptAction } from "@/server/practice/actions";
import type { PracticeActionState } from "@/server/practice/types";
import type { LearnerSafePracticeQuestionWithMeta } from "@/server/practice/questions";
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
      <section className="mx-auto flex max-w-[640px] flex-col items-center gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface px-6 py-10 text-center shadow-sm">
        <NomiMascot state={wrappedUp ? "celebrating" : "curious"} size={56} />
        <h1 className="font-display text-2xl font-bold text-nomi-ink">
          {wrappedUp ? "Practice is all wrapped up." : "No practice questions right now."}
        </h1>
        <p className="max-w-sm text-sm text-nomi-muted">
          {wrappedUp
            ? "You've made it through today's practice session. Nomi will have more questions ready soon."
            : "Nomi doesn't have questions ready for this topic yet. Check back soon."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="min-h-11 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700"
            href="/home"
          >
            Back to home
          </Link>
          <Link
            className="min-h-11 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-white px-6 text-sm font-semibold text-nomi-ink transition-colors hover:bg-nomi-purple-100"
            href="/learn"
          >
            Explore lessons
          </Link>
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
        className="overflow-hidden rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface shadow-sm"
        onSubmit={() => setSubmittedForQuestionId(question.id)}
      >
        <input name="questionId" type="hidden" value={question.id} />
        <input name="questionType" type="hidden" value={question.questionType} />
        <input name="submissionKey" type="hidden" value={submissionKey} />

        <div className="space-y-6 p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold leading-snug text-nomi-ink">
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
                className={`min-h-12 w-full rounded-[var(--nomi-radius-medium)] border bg-white px-4 text-sm text-nomi-ink placeholder:text-nomi-muted ${
                  submitted
                    ? state.result?.correct
                      ? "border-nomi-mint-500"
                      : "border-nomi-pink-500"
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
            <div className="rounded-[var(--nomi-radius-medium)] border border-nomi-purple-100 bg-nomi-purple-100/40 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-nomi-purple-700">
                {guidanceHeading[persistedGuidance.kind]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nomi-ink">
                <MathText text={persistedGuidance.text} />
              </p>
            </div>
          )}

          {!submitted && !failed && (
            <button
              className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canSubmit}
              type="submit"
            >
              {isPending ? "Checking…" : "Check answer"}
            </button>
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