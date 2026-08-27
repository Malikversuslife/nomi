import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NomiMascot, type NomiMascotState } from "@/components/nomi/nomi-mascot";
import type { NextUpView } from "@/domain/progress/types";

const mascotStates: Record<NextUpView["mascotKey"], NomiMascotState> = {
  supportive: "supportive",
  encouraging: "encouraging",
  celebrating: "celebrating",
};

export function NextUp({ view }: { view: NextUpView }) {
  return (
    <section
      aria-labelledby="progress-next-up-heading"
      className="flex flex-col gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-purple-100 bg-nomi-background p-5 shadow-sm sm:flex-row sm:items-start sm:p-6"
    >
      <NomiMascot state={mascotStates[view.mascotKey]} size={44} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
          Next up
        </p>
        <h2
          id="progress-next-up-heading"
          className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
        >
          {view.topicName}
        </h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-nomi-ink">
          {view.message}
        </p>
      </div>

      <Link
        href="/practice"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        Practise
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}