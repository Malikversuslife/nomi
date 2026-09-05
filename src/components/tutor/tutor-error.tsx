import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";

export function TutorError({ onRetry }: { onRetry: () => void }) {
  return (
    <FeedbackBanner
      variant="error"
      action={
        <Button variant="secondary" onClick={onRetry} className="px-4" type="button">
          Try again
        </Button>
      }
    >
      <span className="flex items-center gap-2">
        <NomiCharacter state="supportive" size={32} />
        Nomi couldn&apos;t answer that just now.
      </span>
    </FeedbackBanner>
  );
}
import { NomiCharacter } from "@/components/nomi/nomi-character";
