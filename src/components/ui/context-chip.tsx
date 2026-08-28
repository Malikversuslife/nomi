import { SparklesIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { AppIcon } from "./app-icon";

export function ContextChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface-subtle px-3 text-xs font-semibold text-nomi-ink">
      <AppIcon icon={SparklesIcon} className="text-nomi-purple-600" size={14} strokeWidth={1.5} />
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}