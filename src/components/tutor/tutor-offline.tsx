import Link from "next/link";
import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function TutorOffline() {
  return (
    <section className="mx-auto flex max-w-[640px] flex-col items-center gap-3 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 text-center shadow-sm sm:p-8">
      <NomiMascot state="neutral" size={56} />
      <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
        Nomi is unavailable right now.
      </h1>
      <p className="max-w-sm text-sm text-nomi-muted">
        You can keep practising or explore your learning path.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          className="min-h-11 rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
          href="/practice"
        >
          Practice
        </Link>
        <Link
          className="min-h-11 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-white px-6 text-sm font-semibold text-nomi-ink transition-colors hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2"
          href="/learn"
        >
          Learn
        </Link>
      </div>
    </section>
  );
}