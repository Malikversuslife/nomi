import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { MathText } from "./math-text";

export function HintPanel({
  hint,
  interactive,
}: {
  hint?: string | null;
  interactive: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!hint) {
    return null;
  }

  return (
    <div className="rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface p-4">
      <button
        aria-controls="practice-hint-content"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 rounded-[var(--nomi-radius-pill)] px-1 text-sm font-semibold text-nomi-purple-700"
        disabled={!interactive}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Lightbulb aria-hidden="true" className="h-4 w-4" />
        {open ? "Hide hint" : "Need a hint?"}
        <ChevronDown
          aria-hidden="true"
          className={`ml-1 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="mt-2 text-sm leading-relaxed text-nomi-muted" id="practice-hint-content">
          <MathText text={hint} />
        </p>
      )}
    </div>
  );
}