import Link from "next/link";

export function RecentLearning({
  records,
}: {
  records: Array<{ topic: string; lastPractised: string } | undefined>;
}) {
  if (records.length === 0) {
    return (
      <section className="rounded-[var(--nomi-radius-large)] border border-nomi-border/50 bg-nomi-background px-5 py-6 text-center">
        <p className="mb-1 text-sm font-semibold text-nomi-ink">Nothing here yet</p>
        <p className="mb-4 text-sm text-nomi-muted">
          Complete a practice session and your recent learning will appear here.
        </p>
        <Link
          href="/practice"
          className="inline-flex items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-4 py-2 text-sm font-semibold text-nomi-ink transition-colors hover:bg-nomi-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500"
        >
          Start practising
        </Link>
      </section>
    );
  }

  return (
    <section>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Recent learning
      </p>
      <div className="space-y-2">
        {records.map((record, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[var(--nomi-radius-medium)] border border-nomi-border/50 bg-nomi-surface px-4 py-3"
          >
            <span className="text-sm font-medium text-nomi-ink">
              {record?.topic}
            </span>
            <span className="text-xs text-nomi-muted/60">
              {record?.lastPractised}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
