import { EmptyState } from "@/components/ui/empty-state";
import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function NotificationsExperience() {
  return (
    <EmptyState
      icon={<NomiMascot state="neutral" size={56} />}
      title="You&#39;re all caught up"
      description="Nothing needs your attention right now. When Nomi has something useful about your learning, you&#39;ll find it here."
    />
  );
}