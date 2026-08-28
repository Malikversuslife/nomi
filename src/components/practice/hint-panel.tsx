import { useState } from "react";
import { ChevronDownIcon, LightbulbIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
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
    <div className="rounded-[var(--nomi-radius-medium)] border border-nomi-border-subtle bg-nomi-surface-subtle p-4">
      <button
        aria-controls="practice-hint-content"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 rounded-[var(--nomi-radius-pill)] px-1 text-sm font-semibold text-nomi-purple-700"
        disabled={!interactive}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <AppIcon icon={LightbulbIcon} size={16} strokeWidth={2} />
        {open ? "Hide hint" : "Need a hint?"}
        <AppIcon
          icon={ChevronDownIcon}
          className={`ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={16}
          strokeWidth={2}
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