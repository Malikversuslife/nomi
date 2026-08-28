import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { NomiMascot, type NomiMascotState } from "@/components/nomi/nomi-mascot";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
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
      className="flex flex-col gap-4 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle p-5 sm:flex-row sm:items-start sm:p-6"
    >
      <NomiMascot state={mascotStates[view.mascotKey]} size={44} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <SectionHeader
          id="progress-next-up-heading"
          eyebrow="Next up"
          title={view.topicName}
        />
        <p className="mt-1 text-sm font-medium leading-relaxed text-nomi-ink">
          {view.message}
        </p>
      </div>

      <ButtonLink href="/practice" className="shrink-0 self-start">
        Practise
        <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
      </ButtonLink>
    </section>
  );
}