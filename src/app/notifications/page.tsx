import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { NotificationsExperience } from "@/components/notifications/notifications-experience";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";

export default async function NotificationsPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  await requireUser();

  return (
    <FoundationShell active="">
      <NotificationsExperience />
    </FoundationShell>
  );
}