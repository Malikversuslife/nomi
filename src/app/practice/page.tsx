import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { PracticeSession } from "@/components/practice/practice-session";
import { hasSupabaseConfig } from "@/server/env";
import { getInitialPracticeState } from "@/server/practice/submit";
import { resolveMobileCurriculum } from "@/server/data/mobile-curriculum";
import { requireUser } from "@/server/supabase/auth";

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Practice">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const requestedTopic = (await searchParams).topic;
  const { curriculum, topic } = await resolveMobileCurriculum(user.id, requestedTopic);
  const initialState = topic ? await getInitialPracticeState(topic.id, curriculum.subject?.slug) : { question: null };

  return (
    <FoundationShell active="Practice">
      <PracticeSession key={topic?.id ?? "empty"} initialState={initialState} topic={topic} subjectName={curriculum.subject?.name ?? "Mathematics"} />
    </FoundationShell>
  );
}
