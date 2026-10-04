import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { TutorExperience } from "@/components/tutor/tutor-experience";
import { hasSupabaseConfig } from "@/server/env";
import { requireUser } from "@/server/supabase/auth";
import { loadTutorInitialData } from "@/server/tutor/actions";
import { resolveMobileCurriculum } from "@/server/data/mobile-curriculum";

export default async function NomiPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Nomi">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const requestedTopic = (await searchParams).topic;
  const { topic } = await resolveMobileCurriculum(user.id, requestedTopic);
  const initialData = await loadTutorInitialData(user.id, topic?.id);

  return (
    <FoundationShell active="Nomi">
      <TutorExperience key={topic?.id ?? "general"} initialData={initialData} topicId={topic?.id} />
    </FoundationShell>
  );
}
