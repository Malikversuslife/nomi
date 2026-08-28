import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import type { NomiMascotState } from "@/components/nomi/nomi-mascot";
import { MathText } from "./math-text";
import { NomiReaction } from "./nomi-reaction";
import { AppIcon } from "@/components/ui/app-icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { iconButtonClasses } from "@/components/ui/icon-button";

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
          className={iconButtonClasses()}
          href="/home"
        >
          <AppIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2} />
        </Link>
        <div className="min-w-0">
          <Eyebrow>Practice</Eyebrow>
          <h1 className="truncate font-display text-xl font-bold tracking-[-0.03em] text-nomi-ink">
            <MathText text={conceptName} />
          </h1>
        </div>
      </div>

      <NomiReaction state={reaction} size={32} />
    </header>
  );
}