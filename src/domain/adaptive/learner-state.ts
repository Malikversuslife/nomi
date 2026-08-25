import { deriveConsecutiveAnswerState } from "./consecutive-state";
import { decideDifficulty } from "./difficulty";
import { selectIntervention } from "./interventions";
import { calculateMastery } from "./mastery";
import { updateMisconceptionState } from "./misconceptions";
import { calculateRecentAccuracy } from "./recent-accuracy";
import type { LearnerState, LearnerStateInput } from "./types";

export function deriveLearnerState(input: LearnerStateInput): LearnerState {
  const recentAccuracy = calculateRecentAccuracy(input.attempts);
  const consecutive = deriveConsecutiveAnswerState(input.attempts);
  const mastery = calculateMastery(input.currentMastery ?? 0, input.attempts).mastery;
  const misconceptionSummary = input.misconceptionKey
    ? updateMisconceptionState({
        key: input.misconceptionKey,
        currentStatus: input.misconceptionStatus,
        occurrenceCount: input.misconceptionOccurrenceCount,
        recentAttempts: (input.misconceptionAttempts ?? input.attempts).slice(-8),
      })
    : null;
  const difficultyDecision = decideDifficulty({
    currentDifficulty: input.currentDifficulty ?? 1,
    mastery,
    recentAccuracy,
    consecutive,
  });
  const recommendedIntervention = selectIntervention({
    mastery,
    difficulty: difficultyDecision.difficulty,
    recentAccuracy,
    consecutive,
    misconceptionState: misconceptionSummary,
  });

  return {
    mastery,
    difficulty: difficultyDecision.difficulty,
    recentAccuracy,
    consecutiveCorrect: consecutive.consecutiveCorrect,
    consecutiveIncorrect: consecutive.consecutiveIncorrect,
    misconceptionSummary,
    recommendedIntervention,
    adaptationReasonCode: recommendedIntervention.reasonCode === "no_action_needed" ? difficultyDecision.reasonCode : recommendedIntervention.reasonCode,
  };
}
