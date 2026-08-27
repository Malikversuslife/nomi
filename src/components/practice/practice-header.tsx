import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { NomiMascotState } from "@/components/nomi/nomi-mascot";
import { MathText } from "./math-text";
import { NomiReaction } from "./nomi-reaction";

export function PracticeHeader({
  conceptName,
  reaction,
}: {
  conceptName: string;
  reaction: NomiMascotState;
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          aria-label="Exit practice"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-nomi-border bg-nomi-surface text-nomi-muted transition-colors hover:bg-nomi-purple-100 hover:text-nomi-purple-700"
          href="/home"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-nomi-purple-600">
            Practice
          </p>
          <h1 className="truncate font-display text-xl font-bold tracking-[-0.03em] text-nomi-ink">
            <MathText text={conceptName} />
          </h1>
        </div>
      </div>

      <NomiReaction state={reaction} size={32} />
    </header>
  );
}