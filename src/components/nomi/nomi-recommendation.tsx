import { NomiMascot } from "@/components/nomi/nomi-mascot";

type InterventionType =
  | "continue"
  | "reinforce"
  | "simplify"
  | "worked_example"
  | "hint"
  | "retry"
  | "increase_challenge"
  | "review_prerequisite";

const interventionCopy: Record<InterventionType, (topic?: string) => string> = {
  continue: () => "You're doing well. Keep going.",
  reinforce: (t) =>
    t ? `Let's strengthen ${t} before moving on.` : "Strengthen this before moving on.",
  simplify: () => "Try a simpler version.",
  worked_example: () => "Let's work through an example together.",
  hint: () => "Here is a small clue.",
  retry: () => "Give it another attempt.",
  increase_challenge: () => "You are ready for something tougher.",
  review_prerequisite: (t) =>
    t ? `Let's revisit ${t} — it will make the next part easier.` : "Let's revisit a key idea first.",
};

export function NomiRecommendation({
  intervention,
  topicName,
}: {
  intervention: InterventionType | undefined;
  topicName?: string;
}) {
  if (!intervention) {
    return (
      <section className="mb-5 flex items-center gap-3 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle px-4 py-3 sm:mb-6">
        <NomiMascot state="neutral" size={40} className="flex-shrink-0" />
        <p className="text-sm leading-relaxed text-nomi-muted">
          Complete a practice session and Nomi will have recommendations for you.
        </p>
      </section>
    );
  }

  const message = interventionCopy[intervention](topicName);

  return (
    <section className="mb-5 flex items-start gap-3 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle px-4 py-4 sm:mb-6">
      <NomiMascot state="curious" size={40} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold tracking-[0.06em] text-nomi-purple-700">
          Nomi recommends
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-nomi-ink">
          {message}
        </p>
      </div>
    </section>
  );
}