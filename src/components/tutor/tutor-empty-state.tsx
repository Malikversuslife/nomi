import { NomiMascot } from "@/components/nomi/nomi-mascot";
import type { TutorClientContext } from "@/domain/tutor/types";
import { emptyStateContextLine } from "@/domain/tutor/context";

export function TutorEmptyState({
  context,
  onFill,
}: {
  context: TutorClientContext;
  onFill: (text: string) => void;
}) {
  const contextLine = emptyStateContextLine(context);
  const suggestions = context.topicName
    ? [
        "Explain this concept",
        "Give me a hint",
        "Work through an example",
        "Why did I get this wrong?",
      ]
    : [
        "Explain something simply",
        "Give me a hint",
        "What should I review?",
        "Quiz me",
      ];

  return (
    <div className="flex flex-col items-center gap-1 pt-6 text-center sm:gap-2 sm:pt-8 lg:pt-10">
      <NomiMascot state="curious" size={64} />
      <h1 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
        What are you stuck on?
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-nomi-muted">
        I can explain a concept, work through a problem, or give you a hint.
      </p>
      {contextLine ? <p className="mt-1 text-sm font-semibold text-nomi-ink">{contextLine}</p> : null}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onFill(suggestion)}
            className="min-h-11 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-4 text-sm font-semibold text-nomi-ink transition-colors hover:border-nomi-purple-500 hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}