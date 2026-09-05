import type { NomiCharacterState } from "./nomi-character";

/** Maps existing deterministic intervention keys to companion states. */
export function characterStateForIntervention(
  intervention: string | null | undefined,
): NomiCharacterState {
  switch (intervention) {
    case "reinforce":
      return "reinforcing";
    case "simplify":
    case "retry":
    case "review_prerequisite":
    case "review-prerequisite":
    case "remediation":
      return "supportive";
    case "worked_example":
    case "worked-example":
    case "hint":
      return "thinking";
    case "increase_challenge":
    case "increase-challenge":
    case "challenge":
      return "challenge";
    case "continue":
    case "standard_practice":
      return "encouraging";
    default:
      return "neutral";
  }
}
