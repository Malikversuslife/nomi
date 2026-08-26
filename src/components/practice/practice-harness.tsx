"use client";

import { useActionState } from "react";
import { submitPracticeAttemptAction } from "@/server/practice/actions";
import type { PracticeActionState } from "@/server/practice/types";

function newSubmissionKey() {
  return crypto.randomUUID();
}

function adaptiveMessage(intervention: string): string {
  const messages: Record<string, string> = {
    continue: "",
    reinforce: "Strengthen this before moving on.",
    simplify: "Try a simpler version.",
    worked_example: "I will walk you through one.",
    hint: "Here is a small clue.",
    retry: "Give it another attempt.",
    increase_challenge: "You are ready for something tougher.",
    review_prerequisite: "Revisit one idea that will make this easier.",
  };
  return messages[intervention] || "";
}

export function PracticeHarness({ initialState }: { initialState: PracticeActionState }) {
  const [state, formAction, pending] = useActionState(submitPracticeAttemptAction, initialState);
  const question = state.question ?? initialState.question ?? null;

  if (!question || !question.id) {
    return (
      <p className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 text-nomi-muted">
        No question available.
      </p>
    );
  }

  const isCorrect = state.result?.correct;
  const adaptationMessage = adaptiveMessage(state.result?.intervention ?? "continue");
  const options = question.options ?? [];

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-5 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm">
        <input name="questionId" type="hidden" value={question.id ?? ''} />
        <input name="questionType" type="hidden" value={question.questionType} />
        <input name="submissionKey" type="hidden" defaultValue={newSubmissionKey()} />

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">
          {question.conceptName}
        </p>
        <h2 className="font-display text-2xl font-bold text-nomi-ink">{question.prompt}</h2>
        <p className="text-sm text-nomi-muted">Concept: {question.conceptName}</p>

        {question.questionType === "multiple_choice" && options.length > 0 ? (
          <fieldset className="space-y-3">
            <legend className="sr-only">Answer options</legend>
            {options.map((option) => (
              <label key={option.id} className="flex min-h-12 items-center gap-3 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white px-4 text-sm font-semibold text-nomi-ink">
                <input
                  name="learnerAnswer"
                  required
                  type="radio"
                  value={option.id}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="block space-y-2 text-sm font-semibold text-nomi-ink">
            Your answer
            <input
              className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white px-4"
              name="learnerAnswer"
              required
              type="text"
            />
          </label>
        )}

        <button
          className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={pending}
          type="submit"
        >
          {pending ? "Checking..." : "Submit answer"}
        </button>
      </form>

      {state.result && (
        <section
          className="space-y-3 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm"
        >
          {isCorrect ? (
            <div>
              <h2 className="font-display text-2xl font-bold">Nice work.</h2>
              <p className="text-sm text-nomi-muted">
                You found the right answer.
              </p>
              {question.conceptName && (
                <p className="text-sm text-nomi-muted">
                  Nomi noticed you mastered this concept.
                </p>
              )}
              {adaptationMessage && (
                <p className="mt-3 text-sm text-nomi-ink">{adaptationMessage}</p>
              )}
              <button
                className="mt-3 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white"
                type="button"
              >
                Continue
              </button>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-bold">Not quite.</h2>
<p className="text-sm text-nomi-muted">
              Almost. Try another attempt.
              </p>
              {question.hint && (
                <p className="mt-3 text-sm text-nomi-muted">
                  Need a clue? {question.hint}
                </p>
              )}
              {adaptationMessage && (
                <p className="mt-3 text-sm text-nomi-ink">{adaptationMessage}</p>
              )}
              {question.questionType === "multiple_choice" && options.length > 0 && (
                <p className="mt-3 text-sm text-nomi-muted">
                  Looking at the options, {options[0]?.label?.substring(0, 40) + "..."}
                </p>
              )}
              <button
                className="mt-3 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white"
                type="button"
              >
                Try again
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}