import type { ButtonHTMLAttributes } from "react";

const baseClasses =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-nomi-disabled-bg disabled:border-transparent disabled:text-nomi-disabled-text";

const variantClasses: Record<"secondary" | "primary", string> = {
  secondary:
    "border-nomi-border bg-nomi-surface/80 text-nomi-muted shadow-sm backdrop-blur-xl hover:bg-nomi-surface-raised hover:text-nomi-purple-700 active:scale-95",
  primary:
    "border-transparent bg-nomi-purple-600 text-nomi-on-primary shadow-[0_5px_16px_rgb(108_60_255/0.2)] hover:bg-nomi-purple-700 active:scale-95 active:bg-nomi-purple-700",
};

export function iconButtonClasses(
  className?: string,
  variant: "secondary" | "primary" = "secondary",
): string {
  return `${baseClasses} ${variantClasses[variant]} ${className ?? ""}`;
}

export function IconButton({
  variant = "secondary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "secondary" | "primary";
}) {
  return <button className={iconButtonClasses(className, variant)} {...props} />;
}
