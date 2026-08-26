import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { PracticeHarness } from "@/components/practice/practice-harness";
import { getInitialPracticeState } from "@/server/practice/submit";

export default async function PracticePage() {
  const initialState = await getInitialPracticeState();

  return (
    <FoundationShell active="Learn">
      <section className="mb-5 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Practice</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Keep learning</h1>
        <p className="text-nomi-muted">Nomi will adapt questions to help you learn.</p>
      </section>
      <PracticeHarness initialState={initialState} />
    </FoundationShell>
  );
}
