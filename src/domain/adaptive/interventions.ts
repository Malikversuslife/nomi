import type { ConsecutiveAnswerState, InterventionDecision, Mastery, MisconceptionState, RecentAccuracy } from "./types";

export function selectIntervention(input: {
  mastery: Mastery;
  difficulty: number;
  recentAccuracy: RecentAccuracy;
  consecutive: ConsecutiveAnswerState;
  misconceptionState?: MisconceptionState | null;
}): InterventionDecision {
  const metadata = {
    mastery: input.mastery,
    difficulty: input.difficulty,
    recentAccuracyPercentage: input.recentAccuracy.weightedAccuracyPercentage,
    consecutiveCorrect: input.consecutive.consecutiveCorrect,
    consecutiveIncorrect: input.consecutive.consecutiveIncorrect,
    misconceptionStatus: input.misconceptionState?.status,
    misconceptionKey: input.misconceptionState?.key,
  };

  if (input.recentAccuracy.attemptsConsidered === 0) {
    return { type: "continue", reasonCode: "no_recent_evidence", metadata };
  }

  if (input.misconceptionState?.status === "recurring") {
    return { type: "review-prerequisite", reasonCode: "recurring_misconception_prerequisite", metadata };
  }

  if (input.misconceptionState?.status === "active") {
    return { type: "worked-example", reasonCode: "active_misconception_worked_example", metadata };
  }

  if (input.consecutive.consecutiveIncorrect >= 2) {
    return { type: "retry", reasonCode: "repeated_incorrect_retry", metadata };
  }

  if (input.consecutive.consecutiveIncorrect === 1) {
    return { type: "hint", reasonCode: "single_mistake_hint", metadata };
  }

  if (input.recentAccuracy.weightedAccuracyPercentage <= 40) {
    return { type: "simplify", reasonCode: "low_accuracy_simplify", metadata };
  }

  if (input.mastery < 40 && input.recentAccuracy.weightedAccuracyPercentage < 70) {
    return { type: "reinforce", reasonCode: "low_mastery_reinforce", metadata };
  }

  if (input.consecutive.consecutiveCorrect >= 3 || (input.mastery >= 80 && input.recentAccuracy.weightedAccuracyPercentage >= 80)) {
    return { type: "increase-challenge", reasonCode: "strong_performance_challenge", metadata };
  }

  return { type: "continue", reasonCode: "no_action_needed", metadata };
}
