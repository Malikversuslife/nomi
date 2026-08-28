import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";

export function ErrorPanel({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div aria-live="assertive">
      <FeedbackBanner
        variant="error"
        title="Something went wrong."
        action={
          <Button variant="secondary" onClick={onRetry} type="button">
            Try again
          </Button>
        }
      >
        Your answer wasn&apos;t submitted. No progress was recorded.
      </FeedbackBanner>
    </div>
  );
}