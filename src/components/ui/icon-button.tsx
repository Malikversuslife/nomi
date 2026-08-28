import type { ButtonHTMLAttributes } from "react";

const baseClasses =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-nomi-disabled-bg disabled:border-transparent disabled:text-nomi-disabled-text";

const variantClasses: Record<"secondary" | "primary", string> = {
  secondary:
    "border-nomi-border bg-nomi-surface text-nomi-muted hover:bg-nomi-purple-100 hover:text-nomi-purple-700",
  primary:
    "border-transparent bg-nomi-purple-600 text-white hover:bg-nomi-purple-700",
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