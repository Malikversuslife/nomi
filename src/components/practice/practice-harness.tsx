"use client";

import { useActionState } from "react";
import { submitPracticeAttemptAction } from "@/server/practice/actions";
import type { PracticeActionState } from "@/server/practice/types";

function newSubmissionKey() {
  return crypto.randomUUID();
}

export function PracticeHarness({ initialState }: { initialState: PracticeActionState }) {
  const [state, formAction, pending] = useActionState(submitPracticeAttemptAction, initialState);
  const question = state.question ?? initialState.question ?? null;

  if (!question) {
    return <p className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 text-nomi-muted">No seeded practice question is available.</p>;
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-5 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm">
        <input name="questionId" type="hidden" value={question.id} />
        <input name="questionType" type="hidden" value={question.questionType} />
        <input name="submissionKey" type="hidden" defaultValue={newSubmissionKey()} />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Difficulty {question.difficulty}{question.source === "ai_generated" ? " · Generated" : ""}</p>
        <h2 className="font-display text-2xl font-bold text-nomi-ink">{question.prompt}</h2>
        <p className="text-sm text-nomi-muted">Concept: {question.conceptName}</p>

        {question.questionType === "multiple_choice" && question.options ? (
          <fieldset className="space-y-3">
            <legend className="sr-only">Answer options</legend>
            {question.options.map((option) => (
              <label key={option.id} className="flex min-h-12 items-center gap-3 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white px-4 text-sm font-semibold text-nomi-ink">
                <input name="learnerAnswer" required type="radio" value={option.id} />
                {option.label}
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="block space-y-2 text-sm font-semibold text-nomi-ink">
            Your answer
            <input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white px-4" name="learnerAnswer" required type="text" />
          </label>
        )}

        <button className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={pending} type="submit">
          {pending ? "Checking..." : "Submit answer"}
        </button>
      </form>

      {state.message ? <p className="rounded-[var(--nomi-radius-medium)] bg-nomi-yellow-100 p-4 text-sm text-nomi-ink">{state.message}</p> : null}

      {state.result ? (
        <section className="space-y-3 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm">
          <h2 className="font-display text-2xl font-bold">{state.result.correct ? "Correct" : "Not quite"}</h2>
          <p className="text-sm text-nomi-muted">Answer: {state.result.correctAnswer}</p>
          {state.result.hint ? <p className="text-sm text-nomi-muted">Hint: {state.result.hint}</p> : null}
          <p className="text-sm text-nomi-muted">{state.result.explanation}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[var(--nomi-radius-medium)] bg-nomi-background p-3">
              <dt className="text-nomi-muted">Mastery</dt>
              <dd className="font-semibold text-nomi-ink">{state.result.mastery} ({state.result.masteryChange >= 0 ? "+" : ""}{state.result.masteryChange})</dd>
            </div>
            <div className="rounded-[var(--nomi-radius-medium)] bg-nomi-background p-3">
              <dt className="text-nomi-muted">Difficulty</dt>
              <dd className="font-semibold text-nomi-ink">{state.result.difficulty} ({state.result.difficultyChange >= 0 ? "+" : ""}{state.result.difficultyChange})</dd>
            </div>
            <div className="rounded-[var(--nomi-radius-medium)] bg-nomi-background p-3">
              <dt className="text-nomi-muted">Intervention</dt>
              <dd className="font-semibold text-nomi-ink">{state.result.intervention}</dd>
            </div>
            <div className="rounded-[var(--nomi-radius-medium)] bg-nomi-background p-3">
              <dt className="text-nomi-muted">Next reason</dt>
              <dd className="font-semibold text-nomi-ink">{state.result.adaptationReasonCode}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
