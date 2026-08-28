import {
  CircleCheckIcon,
  CircleXIcon,
  InformationCircleIcon,
  TriangleAlertIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";
import { AppIcon } from "./app-icon";

export type FeedbackVariant = "error" | "warning" | "success" | "info";

const variants: Record<
  FeedbackVariant,
  { container: string; iconClass: string; icon: IconSvgElement }
> = {
  error: {
    container: "border-nomi-error-500/40 bg-nomi-error-100",
    iconClass: "text-nomi-error-500",
    icon: CircleXIcon,
  },
  warning: {
    container: "border-nomi-warning-500/40 bg-nomi-warning-100",
    iconClass: "text-nomi-warning-500",
    icon: TriangleAlertIcon,
  },
  success: {
    container: "border-nomi-success-500/40 bg-nomi-success-100",
    iconClass: "text-nomi-success-500",
    icon: CircleCheckIcon,
  },
  info: {
    container: "border-nomi-info-500/40 bg-nomi-info-100",
    iconClass: "text-nomi-info-500",
    icon: InformationCircleIcon,
  },
};

export function FeedbackBanner({
  variant = "info",
  title,
  children,
  action,
  className,
}: {
  variant?: FeedbackVariant;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const styles = variants[variant];

  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={`flex flex-wrap items-start gap-3 rounded-[var(--nomi-radius-medium)] border p-4 ${styles.container} ${className ?? ""}`}
    >
      <span aria-hidden="true" className={`mt-0.5 shrink-0 ${styles.iconClass}`}>
        <AppIcon icon={styles.icon} size={20} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-bold text-nomi-ink">{title}</p> : null}
        {children ? (
          <div className="mt-0.5 text-sm leading-relaxed text-nomi-muted">{children}</div>
        ) : null}
      </div>
      {action ? <div className="mt-1 sm:mt-0 sm:self-center">{action}</div> : null}
    </div>
  );
}