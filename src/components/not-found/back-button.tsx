"use client";

export function BackButton() {
  return (
    <button
      type="button"
      className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-5 font-semibold text-nomi-ink transition-colors hover:border-nomi-purple-500 hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2"
      onClick={() => window.history.back()}
    >
      Go back
    </button>
  );
}
