export type AdaptiveAttempt = {
  isCorrect: boolean;
  difficulty: number;
};

export type MasteryCalculation = {
  mastery: number;
  previousMastery: number;
  delta: number;
  attemptsConsidered: number;
};

export const DEFAULT_MASTERY = 0;
const MAX_HISTORY = 16;
const RECENT_ACCURACY_WINDOW = 8;

function clampRounded(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function calculateWeightedRecentAccuracy(attempts: AdaptiveAttempt[]) {
  const recentAttempts = attempts.slice(-RECENT_ACCURACY_WINDOW);
  if (recentAttempts.length === 0) return 0;

  let weightedTotal = 0;
  let weightSum = 0;

  recentAttempts.forEach((attempt, index) => {
    const recencyWeight = index + 1;
    weightedTotal += (attempt.isCorrect ? 1 : 0) * recencyWeight;
    weightSum += recencyWeight;
  });

  return Math.round((weightedTotal / weightSum) * 100);
}

export function calculateMastery(
  currentMastery: number = DEFAULT_MASTERY,
  attempts: AdaptiveAttempt[],
): MasteryCalculation {
  const relevantAttempts = attempts.slice(-MAX_HISTORY);

  if (relevantAttempts.length === 0) {
    const mastery = clampRounded(currentMastery, 0, 100);
    return { mastery, previousMastery: mastery, delta: 0, attemptsConsidered: 0 };
  }

  let mastery = clampRounded(currentMastery, 0, 100);
  const previousMastery = mastery;

  relevantAttempts.forEach((attempt, index) => {
    const attemptsBefore = relevantAttempts.slice(Math.max(0, index - 8), index);
    const recentAccuracy = calculateWeightedRecentAccuracy(attemptsBefore) / 100;
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
