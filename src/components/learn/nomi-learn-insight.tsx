import { NomiMascot } from "@/components/nomi/nomi-mascot";
import type { LearnInsightView } from "@/domain/learn/types";

export function NomiLearnInsight({ view }: { view: LearnInsightView }) {
  return (
    <section className="flex items-start gap-3 rounded-[var(--nomi-radius-large)] border border-nomi-border/50 bg-nomi-background px-4 py-4">
      <NomiMascot state="curious" size={36} className="mt-0.5 flex-shrink-0" />
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-nomi-purple-600">
          Nomi suggests
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-nomi-ink">{view.message}</p>
      </div>
    </section>
  );
}