import type { ReactNode } from "react";

export type BadgeTone = "default" | "progress" | "success" | "warning" | "info";

const toneStyles: Record<BadgeTone, { container: string; dot: string }> = {
  default: {
    container: "border border-nomi-border bg-nomi-surface text-nomi-muted",
    dot: "bg-nomi-border",
  },
  progress: {
    container: "bg-nomi-purple-100 text-nomi-purple-700",
    dot: "bg-nomi-purple-600",
  },
  success: {
    container: "bg-nomi-success-100 text-nomi-success-500",
    dot: "bg-nomi-success-500",
  },
  warning: {
    container: "bg-nomi-warning-100 text-nomi-warning-500",
    dot: "bg-nomi-warning-500",
  },
  info: {
    container: "bg-nomi-info-100 text-nomi-info-500",
    dot: "bg-nomi-info-500",
  },
};

export function StatusBadge({
  tone = "default",
  label,
  dot = true,
  className,
}: {
  tone?: BadgeTone;
  label: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const styles = toneStyles[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--nomi-radius-pill)] px-2 py-0.5 text-[11px] font-semibold ${styles.container} ${className ?? ""}`}
    >
      {dot ? (
        <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
      ) : null}
      {label}
    </span>
  );
}

export function topicStateTone(stateKey: string): BadgeTone {
  switch (stateKey) {
    case "in-progress":
      return "progress";
    case "needs-practice":
      return "warning";
    case "strong":
      return "success";
    default:
      return "default";
  }
}