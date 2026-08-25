import { clampRounded } from "./math";
import { calculateRecentAccuracy } from "./recent-accuracy";
import type { AdaptiveAttempt, Mastery } from "./types";

export type MasteryCalculation = {
  mastery: Mastery;
  previousMastery: Mastery;
  delta: number;
  attemptsConsidered: number;
};

export const DEFAULT_MASTERY = 0;
const MAX_HISTORY = 16;

export function calculateMastery(currentMastery: Mastery = DEFAULT_MASTERY, attempts: AdaptiveAttempt[]): MasteryCalculation {
  const relevantAttempts = attempts.slice(-MAX_HISTORY);

  if (relevantAttempts.length === 0) {
    return {
      mastery: clampRounded(currentMastery, 0, 100),
      previousMastery: clampRounded(currentMastery, 0, 100),
      delta: 0,
      attemptsConsidered: 0,
    };
  }

  let mastery = clampRounded(currentMastery, 0, 100);
  const previousMastery = mastery;

  relevantAttempts.forEach((attempt, index) => {
    const attemptsBefore = relevantAttempts.slice(Math.max(0, index - 8), index);
    const recentAccuracy = calculateRecentAccuracy(attemptsBefore).weightedAccuracyPercentage / 100;
    const recencyWeight = 0.7 + ((index + 1) / relevantAttempts.length) * 0.3;
    const correctnessSign = attempt.isCorrect ? 1 : -1.2;
    const difficultyWeight = 0.6 + attempt.difficulty / 10;
    const performanceWeight = recentAccuracy >= 0.8 ? 1.1 : recentAccuracy >= 0.5 ? 1 : 0.9;
    const easyRepeatWeight = attempt.isCorrect && attempt.difficulty <= 3 && mastery >= 70 ? 0.45 : 1;
    const mistakeProtectionWeight = !attempt.isCorrect && mastery >= 75 ? 0.6 : 1;
    const delta = correctnessSign * difficultyWeight * performanceWeight * easyRepeatWeight * mistakeProtectionWeight * recencyWeight * 4;

    mastery = clampRounded(mastery + delta, 0, 100);
  });

  return {
    mastery,
    previousMastery,
    delta: mastery - previousMastery,
    attemptsConsidered: relevantAttempts.length,
  };
}
