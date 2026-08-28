import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function TutorOffline() {
  return (
    <EmptyState
      icon={<NomiMascot state="neutral" size={56} />}
      title="Nomi is unavailable right now."
      description="You can keep practising or explore your learning path."
    >
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/practice">Practice</ButtonLink>
        <ButtonLink href="/learn" variant="secondary">
          Learn
        </ButtonLink>
      </div>
    </EmptyState>
  );
}