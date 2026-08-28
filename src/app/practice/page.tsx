import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { PracticeSession } from "@/components/practice/practice-session";
import { hasSupabaseConfig } from "@/server/env";
import { getInitialPracticeState } from "@/server/practice/submit";

export default async function PracticePage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Practice">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const initialState = await getInitialPracticeState();

  return (
    <FoundationShell active="Practice">
      <PracticeSession initialState={initialState} />
    </FoundationShell>
  );
}