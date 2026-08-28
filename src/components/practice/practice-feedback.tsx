import { ArrowRight01Icon, RefreshCwIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { MathText } from "./math-text";
import {
  feedbackCopy,
  guidanceForResult,
  guidanceHeading,
  reactionForResult,
} from "./feedback";
import { NomiReaction } from "./nomi-reaction";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";

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
      className="space-y-4 rounded-[var(--nomi-radius-feature)] bg-nomi-surface-subtle p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-nomi-ink">{copy.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-nomi-muted">{copy.message}</p>
        </div>
        <NomiReaction state={reactionForResult(result)} size={44} />
      </div>

      {guidance && (
        <FeedbackBanner variant="info" title={guidanceHeading[guidance.kind]}>
          <MathText text={guidance.text} />
        </FeedbackBanner>
      )}

      <div className="pt-1">
        {result.correct ? (
          <Button size="lg" className="w-full" onClick={onContinue} type="button">
            Continue
            <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={onRetry} type="button">
            <AppIcon icon={RefreshCwIcon} size={16} strokeWidth={2.25} />
            Try again
          </Button>
        )}
      </div>
    </section>
  );
}