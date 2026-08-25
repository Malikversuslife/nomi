import type { MisconceptionEvidence, MisconceptionState, MisconceptionStatus } from "./types";

export function updateMisconceptionState(evidence: MisconceptionEvidence): MisconceptionState {
  const recentIncorrectWithMisconception = evidence.recentAttempts.filter((attempt) => !attempt.isCorrect && attempt.misconceptionKey === evidence.key).length;
  const recentCorrectWithoutMisconception = evidence.recentAttempts.filter((attempt) => attempt.isCorrect && attempt.misconceptionKey !== evidence.key).length;
  const previousOccurrences = evidence.occurrenceCount ?? 0;
  const occurrenceCount = previousOccurrences + recentIncorrectWithMisconception;
  let status: MisconceptionStatus = evidence.currentStatus ?? "active";

  if (recentIncorrectWithMisconception >= 2 || (previousOccurrences >= 2 && recentIncorrectWithMisconception >= 1)) {
    status = "recurring";
  } else if (recentCorrectWithoutMisconception >= 2 && (status === "active" || status === "recurring")) {
    status = "improving";
  } else if (recentCorrectWithoutMisconception >= 3 && recentIncorrectWithMisconception === 0) {
    status = "resolved";
  } else if (recentIncorrectWithMisconception >= 1) {
    status = "active";
  }

  return {
    key: evidence.key,
    status,
    occurrenceCount: Math.max(1, occurrenceCount),
    recentIncorrectWithMisconception,
    recentCorrectWithoutMisconception,
  };
}
