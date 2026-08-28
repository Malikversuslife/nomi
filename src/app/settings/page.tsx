import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { SettingsExperience } from "@/components/settings/settings-experience";
import { hasSupabaseConfig } from "@/server/env";
import { getProfileExperienceData } from "@/server/profile/data";
import { requireUser } from "@/server/supabase/auth";

export default async function SettingsPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const data = await getProfileExperienceData(user.id, user.email ?? "");

  return (
    <FoundationShell active="">
      <SettingsExperience data={data} />
    </FoundationShell>
  );
}