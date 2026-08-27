import { ArrowRight, RefreshCw } from "lucide-react";
import { MathText } from "./math-text";
import {
  feedbackCopy,
  guidanceForResult,
  guidanceHeading,
  reactionForResult,
} from "./feedback";
import { NomiReaction } from "./nomi-reaction";

export type FeedbackResult = {
  correct: boolean;
  explanation: string;
  hint?: string;
  intervention?: string | null;
  consecutiveCorrect?: number;
  difficultyChange?: number;
};

export function PracticeFeedback({
  result,
  onContinue,
  onRetry,
}: {
  result: FeedbackResult;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const copy = feedbackCopy(result);
  const guidance = guidanceForResult(result);

  return (
    <section
      aria-live="polite"
      className="space-y-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-nomi-ink">{copy.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-nomi-muted">{copy.message}</p>
        </div>
        <NomiReaction state={reactionForResult(result)} size={44} />
      </div>

      {guidance && (
        <div className="rounded-[var(--nomi-radius-medium)] border border-nomi-purple-100 bg-nomi-purple-100/40 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-nomi-purple-700">
            {guidanceHeading[guidance.kind]}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-nomi-ink">
            <MathText text={guidance.text} />
          </p>
        </div>
      )}

      <div className="pt-1">
        {result.correct ? (
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700"
            onClick={onContinue}
            type="button"
          >
            Continue
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    </section>
  );
}