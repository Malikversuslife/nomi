import type { AdaptiveAttempt, ConsecutiveAnswerState } from "./types";

export function updateConsecutiveAnswerState(previous: ConsecutiveAnswerState, isCorrect: boolean): ConsecutiveAnswerState {
  if (isCorrect) {
    return {
      consecutiveCorrect: previous.consecutiveCorrect + 1,
      consecutiveIncorrect: 0,
    };
  }

  return {
    consecutiveCorrect: 0,
    consecutiveIncorrect: previous.consecutiveIncorrect + 1,
  };
}

export function deriveConsecutiveAnswerState(attempts: AdaptiveAttempt[]): ConsecutiveAnswerState {
  return attempts.reduce<ConsecutiveAnswerState>(
    (state, attempt) => updateConsecutiveAnswerState(state, attempt.isCorrect),
    { consecutiveCorrect: 0, consecutiveIncorrect: 0 },
  );
}
