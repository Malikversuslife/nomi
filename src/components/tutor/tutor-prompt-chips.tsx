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
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onFill(prompt)}
          className="min-h-11 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-3.5 text-[13px] font-semibold text-nomi-muted transition-colors hover:border-nomi-purple-500 hover:text-nomi-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}