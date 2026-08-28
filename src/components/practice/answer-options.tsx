import { CircleCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { MathText } from "./math-text";

type PracticeOption = { id: string; label: string };

export function AnswerOptions({
  options,
  selectedId,
  submitted,
  revealCorrect,
  interactive,
  onSelect,
}: {
  options: PracticeOption[];
  selectedId: string;
  submitted: boolean;
  revealCorrect: boolean;
  interactive: boolean;
  onSelect: (id: string) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className="space-y-3" disabled={!interactive}>
      <legend className="sr-only">Answer options</legend>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        const isConfirmedCorrect = submitted && isSelected && revealCorrect;
        const isWrongSelection = submitted && isSelected && !revealCorrect;

        let tileClasses =
          "border-nomi-border bg-nomi-surface hover:border-nomi-purple-500 hover:bg-nomi-purple-100/50";
        let sideLabel: string | null = null;
        let showCheck = false;

        if (isConfirmedCorrect) {
          tileClasses = "border-nomi-success-500 bg-nomi-success-100";
          sideLabel = "Correct answer";
          showCheck = true;
        } else if (isWrongSelection) {
          tileClasses = "border-nomi-error-500 bg-nomi-error-100";
          sideLabel = "Your answer";
        } else if (isSelected) {
          tileClasses = "border-nomi-purple-500 bg-nomi-purple-100";
        } else if (submitted) {
          tileClasses = "border-nomi-border bg-nomi-surface opacity-60";
        }

        return (
          <label
            key={option.id}
            className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[var(--nomi-radius-medium)] border px-4 py-3.5 text-left text-sm font-semibold text-nomi-ink transition-colors has-focus-visible:ring-2 has-focus-visible:ring-nomi-purple-500 ${tileClasses}`}
          >
            <input
              aria-label={option.label}
              checked={isSelected}
              className="sr-only"
              disabled={!interactive}
              name="learnerAnswer"
              onChange={() => onSelect(option.id)}
              type="radio"
              value={option.id}
            />
            <span className="flex-1 leading-snug">
              <MathText text={option.label} />
            </span>
            {sideLabel && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-nomi-ink">
                {sideLabel}
                {showCheck && <AppIcon icon={CircleCheckIcon} size={14} strokeWidth={2.5} />}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}