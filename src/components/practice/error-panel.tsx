import { AlertTriangle } from "lucide-react";

export function ErrorPanel({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <section
      aria-live="assertive"
      role="alert"
      className="space-y-3 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-nomi-yellow-500" />
        <div>
          <h2 className="font-display text-lg font-bold text-nomi-ink">
            Something went wrong.
          </h2>
          <p className="text-sm text-nomi-muted">Your answer wasn&apos;t submitted. No progress was recorded.</p>
        </div>
      </div>
      <button
        className="min-h-12 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}