import Link from "next/link";

export function ContinueLearningCard({
  subject,
  currentTopic,
  nextTopic,
}: {
  subject?: string;
  currentTopic?: string;
  nextTopic?: string;
}) {
  const hasData = Boolean(subject || currentTopic);

  return (
    <section className="mb-5 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-4 shadow-sm sm:mb-6 sm:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Continue learning
      </p>

      {hasData ? (
        <div className="space-y-1">
          {subject && (
            <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-nomi-ink">
              {subject}
            </h2>
          )}
          {currentTopic && (
            <p className="text-sm text-nomi-muted">{currentTopic}</p>
          )}
          {nextTopic && (
            <p className="text-xs text-nomi-muted/60">
              Up next: {nextTopic}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-nomi-ink">
            Start learning
          </h2>
          <p className="text-sm text-nomi-muted">
            Pick a subject below to begin.
          </p>
        </div>
      )}

      <Link
        href="/practice"
        className="mt-5 inline-flex items-center justify-center rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        Continue practice
      </Link>
    </section>
  );
}
