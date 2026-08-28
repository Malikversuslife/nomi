import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { hasSupabaseConfig } from "@/server/env";
import { getProfileExperienceData } from "@/server/profile/data";
import { requireUser } from "@/server/supabase/auth";

export default async function ProfilePage() {
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
      <ProfileExperience data={data} />
    </FoundationShell>
  );
}