import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LearnContinueView } from "@/domain/learn/types";

export function LearnContinueCard({ view }: { view: LearnContinueView }) {
  if (view.kind === "start") {
    return (
      <section className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
          Start learning
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
          You&apos;re ready to start.
        </h2>
        <p className="mt-1 text-sm text-nomi-muted">
          Choose a topic and Nomi will begin adapting as you practise.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--nomi-radius-large)] border border-nomi-purple-100 bg-nomi-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Continue learning
      </p>
      <p className="mt-2 text-sm text-nomi-muted">
        {view.parentName ? `${view.parentName} · ` : ""}
        {view.subjectName}
      </p>
      <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
        {view.topicName}
      </h2>
      <p className="mt-1 text-sm font-semibold text-nomi-ink">{view.state.label}</p>

      <Link
        href="/practice"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        Continue practice
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}