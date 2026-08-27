import type { ProgressOverview } from "@/domain/progress/types";

const VISIBLE_CATEGORIES = [
  {
    key: "workingOn",
    label: "Working on",
    dotClass: "bg-nomi-purple-500",
  },
  {
    key: "strong",
    label: "Strong",
    dotClass: "bg-nomi-mint-500",
  },
  {
    key: "needsPractice",
    label: "Needs practice",
    dotClass: "bg-nomi-yellow-500",
  },
] as const;

export function ProgressOverview({ overview }: { overview: ProgressOverview }) {
  const items = VISIBLE_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    dotClass: category.dotClass,
    count: overview[category.key],
  })).filter((item) => item.count > 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="progress-overview-heading"
      className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm sm:p-6"
    >
      <h2
        id="progress-overview-heading"
        className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
      >
        Your learning at a glance
      </h2>
      <p className="mt-1 text-sm text-nomi-muted">
        A simple snapshot of where you&apos;re at right now.
      </p>

      <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-2.5 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white/70 px-4 py-3 sm:min-w-[8.5rem] sm:flex-1"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClass}`}
            />
            <p className="text-sm leading-tight">
              <span className="text-lg font-bold text-nomi-ink">{item.count}</span>{" "}
              <span className="font-medium text-nomi-ink">{item.label}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}