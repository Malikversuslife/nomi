import type { RecentLearningItem } from "@/domain/progress/types";

const kindStyles: Record<RecentLearningItem["kind"], { container: string; dot: string; label: string }> = {
  correct: {
    container: "bg-nomi-mint-100 text-nomi-ink",
    dot: "bg-nomi-mint-500",
    label: "Correct answer",
  },
  incorrect: {
    container: "bg-nomi-yellow-100 text-nomi-ink",
    dot: "bg-nomi-yellow-500",
    label: "Keep going",
  },
};

export function RecentLearning({ items }: { items: RecentLearningItem[] }) {
  return (
    <section aria-labelledby="progress-recent-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Recent learning
      </p>
      <h2
        id="progress-recent-heading"
        className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
      >
        Recent learning
      </h2>

      <ol className="mt-4 space-y-2.5">
        {items.map((item) => {
          const styles = kindStyles[item.kind];

          return (
            <li
              key={item.key}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white/70 p-3 sm:p-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-nomi-ink">{item.topicName}</p>
                {item.conceptName ? (
                  <p className="mt-0.5 text-xs text-nomi-muted">{item.conceptName}</p>
                ) : null}
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-[var(--nomi-radius-pill)] px-2 py-0.5 text-[11px] font-semibold ${styles.container}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                {styles.label}
              </span>
              <span className="text-xs text-nomi-muted">{item.whenLabel}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}