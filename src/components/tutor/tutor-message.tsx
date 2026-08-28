import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { MathText } from "@/components/practice/math-text";
import { ButtonLink } from "@/components/ui/button";
import type { TutorMessageView } from "@/domain/tutor/types";

export function TutorMessage({ message }: { message: TutorMessageView }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-[var(--nomi-radius-large)] border border-nomi-purple-100 bg-nomi-purple-100/70 px-4 py-2.5 text-sm leading-relaxed text-nomi-ink">
          <MathText text={message.content} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <NomiMascot state="neutral" size={24} className="mt-1 flex-shrink-0" />
      <div className="min-w-0 flex-1 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle p-4">
        <p className="whitespace-pre-line text-sm leading-relaxed text-nomi-ink">
          <MathText text={message.content} />
        </p>
        {message.followUp ? (
          <p className="mt-2 text-sm font-medium italic text-nomi-muted">
            Nomi asks: {message.followUp}
          </p>
        ) : null}
        {message.suggestedAction ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestedAction === "practice" ? (
              <ButtonLink href="/practice" size="sm">
                Practice this topic
              </ButtonLink>
            ) : null}
            {message.suggestedAction === "review" ? (
              <ButtonLink href="/learn" size="sm" variant="secondary">
                Review this topic
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}