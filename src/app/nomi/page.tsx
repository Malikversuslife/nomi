import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { TutorExperience } from "@/components/tutor/tutor-experience";
import { TutorOffline } from "@/components/tutor/tutor-offline";
import { getConfiguredAiProvider } from "@/server/ai/provider";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";
import { loadTutorInitialData } from "@/server/tutor/actions";

export default async function NomiPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Nomi">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const providerAvailable = Boolean(getConfiguredAiProvider());

  if (!providerAvailable) {
    return (
      <FoundationShell active="Nomi">
        <TutorOffline />
      </FoundationShell>
    );
  }

  const initialData = await loadTutorInitialData(user.id);

  return (
    <FoundationShell active="Nomi">
      <TutorExperience initialData={initialData} />
    </FoundationShell>
  );
}