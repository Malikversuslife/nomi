import { Button } from "@/components/ui/button";

export function TutorPromptChips({
  prompts,
  onFill,
  disabled,
}: {
  prompts: string[];
  onFill: (text: string) => void;
  disabled?: boolean;
}) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => onFill(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}