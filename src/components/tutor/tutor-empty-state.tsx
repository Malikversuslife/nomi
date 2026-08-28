import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    <EmptyState
      icon={<NomiMascot state="curious" size={64} />}
      title="What are you stuck on?"
      description="I can explain a concept, work through a problem, or give you a hint."
    >
      {contextLine ? (
        <p className="mt-2 text-sm font-semibold text-nomi-ink">{contextLine}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onFill(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </EmptyState>
  );
}