import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function ProgressEmptyState() {
  return (
    <EmptyState
      icon={<NomiMascot state="curious" size={64} />}
      title="Your progress starts here"
      description="Complete a few practice questions and Nomi will start showing what you're getting stronger at and where to focus next."
    >
      <ButtonLink href="/practice">
        Start practising
        <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
      </ButtonLink>
    </EmptyState>
  );
}