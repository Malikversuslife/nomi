import type { RecentLearningItem } from "@/domain/progress/types";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

export function RecentLearning({ items }: { items: RecentLearningItem[] }) {
  return (
    <section aria-labelledby="progress-recent-heading">
      <SectionHeader
        id="progress-recent-heading"
        eyebrow="Progress"
        title="Recent learning"
        description="Your latest practice results, newest first."
      />

      <ol className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--nomi-radius-medium)] bg-nomi-surface-subtle p-3 sm:p-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-nomi-ink">{item.topicName}</p>
              {item.conceptName ? (
                <p className="mt-0.5 text-xs text-nomi-muted">{item.conceptName}</p>
              ) : null}
            </div>
            <StatusBadge
              tone={item.kind === "correct" ? "success" : "warning"}
              label={item.kind === "correct" ? "Correct answer" : "Keep going"}
            />
            <span className="text-xs text-nomi-muted">{item.whenLabel}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}