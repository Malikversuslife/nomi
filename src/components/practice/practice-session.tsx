"use client";

import { useActionState, useState } from "react";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { submitPracticeAttemptAction } from "@/server/practice/actions";
import type { PracticeActionState } from "@/server/practice/types";
import type { PracticeResult } from "@/server/practice/types";
import type { CurrentTopic } from "@/server/data/mobile-curriculum";
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
  type PracticeGuidance,
} from "./feedback";

function newSubmissionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PracticeSession({ initialState, topic, subjectName }: { initialState: PracticeActionState; topic: CurrentTopic | null; subjectName: string }) {
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
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lastResult, setLastResult] = useState<PracticeResult | null>(null);
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

  if (completed) {
    const mastered = correctCount >= 4 && (lastResult?.mastery ?? 0) >= 80;
    return (
      <section className="mx-auto flex max-w-[560px] flex-col items-center rounded-[var(--nomi-radius-feature)] bg-nomi-surface px-6 py-10 text-center shadow-sm">
        <NomiCharacter state={mastered ? "celebrating" : "supportive"} size={104} />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-nomi-purple-600">{mastered ? "Topic mastered" : "Practice complete"}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-nomi-ink">{mastered ? `You've mastered ${topic?.name ?? "this topic"}.` : `Let's strengthen ${topic?.name ?? "this topic"}.`}</h1>
        <p className="mt-4 text-lg font-bold text-nomi-purple-600">{correctCount} / {answeredCount} correct · {lastResult?.mastery ?? 0}/100 mastery</p>
        <div className="mt-6 w-full rounded-[var(--nomi-radius-large)] bg-nomi-purple-50 p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Nomi adapted</p>
          <p className="mt-2 text-sm leading-relaxed text-nomi-muted">Nomi will use your answers and recent mistakes to shape what comes next.</p>
        </div>
        <ButtonLink href={mastered ? "/learn" : `/nomi?topic=${encodeURIComponent(topic?.id ?? "")}`} className="mt-7 w-full justify-center">
          {mastered ? "See what's next" : "Review weak spots with Nomi"}
        </ButtonLink>
        <Button variant="secondary" className="mt-3 w-full justify-center" onClick={() => {
          setQuestion(initialState.question ?? null);
          setAnsweredCount(0);
          setCorrectCount(0);
          setCompleted(false);
          setLastResult(null);
          setSubmittedForQuestionId(null);
          setSelectedId("");
          setTextAnswer("");
          setPersistedGuidance(null);
          setSubmissionKey(newSubmissionKey());
        }}>Practice again</Button>
      </section>
    );
  }

  if (!question) {
    const wrappedUp = answeredCount > 0;
    return (
      <section className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-2 py-8 text-center">
        <NomiCharacter state={wrappedUp ? "celebrating" : "curious"} size={80} />
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

  function handleRetry() {
    if (state.result) {
      setPersistedGuidance(guidanceForResult(state.result));
    }
    setSubmittedForQuestionId(null);
    setSelectedId("");
    setSubmissionKey(newSubmissionKey());
  }

  function handleContinue() {
    const count = answeredCount + 1;
    const next = initialState.questions?.[count] ?? state.result?.nextQuestion ?? null;
    setAnsweredCount(count);
    if (state.result?.correct) setCorrectCount((value) => value + 1);
    setLastResult(state.result ?? null);
    if (count >= 5 || !next) {
      setCompleted(true);
      return;
    }
    setQuestion(next);
    setSubmittedForQuestionId(null);
    setSelectedId("");
    setTextAnswer("");
    setPersistedGuidance(null);
    setSubmissionKey(newSubmissionKey());
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">
        <span>{subjectName} · {topic?.name ?? question.conceptName}</span>
        <span>Question {answeredCount + 1} of 5 · Level {question.difficulty}</span>
      </div>
      <PracticeHeader conceptName={question.conceptName} />

      <form
        action={formAction}
        className="space-y-6"
        onSubmit={() => setSubmittedForQuestionId(question.id)}
      >
        <input name="questionId" type="hidden" value={question.id} />
        <input name="questionType" type="hidden" value={question.questionType} />
        <input name="submissionKey" type="hidden" value={submissionKey} />
        <input name="skipNextQuestion" type="hidden" value={initialState.questions?.length === 5 ? "true" : "false"} />

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
            allowContinueOnIncorrect
            onContinue={handleContinue}
            onRetry={handleRetry}
            result={{ ...state.result, correctAnswer: question.options?.find((option) => option.id === state.result?.correctAnswer)?.label ?? state.result.correctAnswer }}
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
