import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-nomi-purple-600 text-white hover:bg-nomi-purple-700 disabled:bg-nomi-disabled-bg disabled:text-nomi-disabled-text disabled:shadow-none",
  secondary:
    "border border-nomi-border bg-nomi-surface text-nomi-ink hover:border-nomi-purple-500 hover:bg-nomi-purple-100 disabled:border-transparent disabled:bg-nomi-disabled-bg disabled:text-nomi-disabled-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4",
  md: "min-h-11 px-5",
  lg: "min-h-12 px-6",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--nomi-radius-pill)] text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}