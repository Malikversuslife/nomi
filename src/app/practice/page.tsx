import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { PracticeSession } from "@/components/practice/practice-session";
import { getInitialPracticeState } from "@/server/practice/submit";

export default async function PracticePage() {
  const initialState = await getInitialPracticeState();

  return (
    <FoundationShell active="Practice">
      <PracticeSession initialState={initialState} />
    </FoundationShell>
  );
}