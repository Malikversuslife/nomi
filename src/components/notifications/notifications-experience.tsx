import { EmptyState } from "@/components/ui/empty-state";
import { NomiCharacter } from "@/components/nomi/nomi-character";

export function NotificationsExperience() {
  return (
    <EmptyState
      icon={<NomiCharacter state="supportive" size={80} />}
      title="You&#39;re all caught up"
      description="Nothing needs your attention right now. When Nomi has something useful about your learning, you&#39;ll find it here."
      className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface-subtle p-6"
    />
  );
}
