import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function ProgressEmptyState() {
  return (
    <section className="mx-auto max-w-[640px] rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-8 text-center shadow-sm">
      <div className="flex justify-center">
        <NomiMascot state="curious" size={64} />
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-nomi-ink">
        Your progress starts here
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-nomi-muted">
        Complete a few practice questions and Nomi will start showing what you&apos;re
        getting stronger at and where to focus next.
      </p>
      <Link
        href="/practice"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
      >
        Start practising
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}