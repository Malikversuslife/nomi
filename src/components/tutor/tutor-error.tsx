import { AlertTriangle } from "lucide-react";

export function TutorError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface p-3"
    >
      <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-nomi-yellow-500" />
      <p className="min-w-0 flex-1 text-sm font-medium text-nomi-ink">
        Nomi couldn&apos;t answer that just now.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}