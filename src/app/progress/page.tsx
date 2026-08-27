import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { ProgressExperience } from "@/components/progress/progress-experience";
import { hasSupabaseConfig } from "@/server/env";
import { buildProgressExperience } from "@/server/progress/presentation";
import { requireUser } from "@/server/supabase/auth";

export default async function ProgressPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Progress">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const data = await buildProgressExperience(user.id);

  return (
    <FoundationShell active="Progress">
      <ProgressExperience data={data} />
    </FoundationShell>
  );
}