import type { AdaptiveAttempt, RecentAccuracy } from "./types";

export const DEFAULT_RECENT_ACCURACY_WINDOW = 8;

export function calculateRecentAccuracy(attempts: AdaptiveAttempt[], windowSize = DEFAULT_RECENT_ACCURACY_WINDOW): RecentAccuracy {
  const recentAttempts = attempts.slice(-windowSize);
  const attemptsConsidered = recentAttempts.length;

  if (attemptsConsidered === 0) {
    return {
      attemptsConsidered: 0,
      correctCount: 0,
      accuracyPercentage: 0,
      weightedAccuracyPercentage: 0,
      windowSize,
    };
  }

  const correctCount = recentAttempts.filter((attempt) => attempt.isCorrect).length;
  const accuracyPercentage = Math.round((correctCount / attemptsConsidered) * 100);
  let weightedTotal = 0;
  let weightSum = 0;

  recentAttempts.forEach((attempt, index) => {
    const recencyWeight = index + 1;
    weightedTotal += (attempt.isCorrect ? 1 : 0) * recencyWeight;
    weightSum += recencyWeight;
  });

  return {
    attemptsConsidered,
    correctCount,
    accuracyPercentage,
    weightedAccuracyPercentage: Math.round((weightedTotal / weightSum) * 100),
    windowSize,
  };
}
