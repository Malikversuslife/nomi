import { clampRounded } from "./math";
import type { ConsecutiveAnswerState, DifficultyDecision, Mastery, RecentAccuracy } from "./types";

export function decideDifficulty(input: {
  currentDifficulty: number;
  mastery: Mastery;
  recentAccuracy: RecentAccuracy;
  consecutive: ConsecutiveAnswerState;
}): DifficultyDecision {
  const previousDifficulty = clampRounded(input.currentDifficulty, 1, 10);

  if (input.recentAccuracy.attemptsConsidered === 0) {
    return { difficulty: previousDifficulty, previousDifficulty, reasonCode: "no_evidence" };
  }

  let nextDifficulty = previousDifficulty;
  let reasonCode: DifficultyDecision["reasonCode"] = "stable";

  if (input.consecutive.consecutiveIncorrect >= 2 || input.recentAccuracy.weightedAccuracyPercentage <= 35) {
    nextDifficulty -= 1;
    reasonCode = "repeated_mistakes";
  } else if (input.mastery < 35 && input.recentAccuracy.weightedAccuracyPercentage < 60) {
    nextDifficulty -= 1;
    reasonCode = "low_mastery_reinforce";
  } else if (input.consecutive.consecutiveCorrect >= 3) {
    nextDifficulty += 1;
    reasonCode = "sustained_correct_streak";
  } else if (input.recentAccuracy.attemptsConsidered >= 4 && input.recentAccuracy.weightedAccuracyPercentage >= 85) {
    nextDifficulty += 1;
    reasonCode = "strong_recent_performance";
  } else if (input.mastery >= 85 && input.recentAccuracy.weightedAccuracyPercentage >= 75) {
    nextDifficulty += 1;
    reasonCode = "high_mastery_stretch";
  }

  const boundedDifficulty = clampRounded(nextDifficulty, 1, 10);

  if (boundedDifficulty !== nextDifficulty) {
    reasonCode = nextDifficulty < 1 ? "lower_boundary" : "upper_boundary";
  }

  return {
    difficulty: boundedDifficulty,
    previousDifficulty,
    reasonCode,
  };
}
