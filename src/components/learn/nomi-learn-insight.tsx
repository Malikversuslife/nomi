import { NomiMascot } from "@/components/nomi/nomi-mascot";
import type { LearnInsightView } from "@/domain/learn/types";

export function NomiLearnInsight({ view }: { view: LearnInsightView }) {
  return (
    <section className="flex items-start gap-3 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle px-4 py-4">
      <NomiMascot state="curious" size={36} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-ink/60">
          Nomi suggests
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-nomi-ink">{view.message}</p>
      </div>
    </section>
  );
}