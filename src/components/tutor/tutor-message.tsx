import Link from "next/link";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { MathText } from "@/components/practice/math-text";
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
      <div className="min-w-0 flex-1 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-4 shadow-sm">
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
              <Link
                href="/practice"
                className="min-h-11 inline-flex items-center justify-center rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
              >
                Practice this topic
              </Link>
            ) : null}
            {message.suggestedAction === "review" ? (
              <Link
                href="/learn"
                className="min-h-11 inline-flex items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-4 text-sm font-semibold text-nomi-ink transition-colors hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
              >
                Review this topic
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}