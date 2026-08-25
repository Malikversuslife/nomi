import type { AdaptiveAttempt, MisconceptionStatus } from "@/domain/adaptive/types";

export type MisconceptionIdentity = {
  topicProgressId: string;
  key: string;
  category: string;
};

export type PreviousMisconceptionRecord = {
  status: MisconceptionStatus;
  occurrence_count: number;
};

export function getMisconceptionIdentity(input: {
  topicProgressId: string;
  misconceptionKey: string | null;
  misconceptionCategory: string | null;
}): MisconceptionIdentity | null {
  if (!input.misconceptionKey || !input.misconceptionCategory) {
    return null;
  }

  return {
    topicProgressId: input.topicProgressId,
    key: input.misconceptionKey,
    category: input.misconceptionCategory,
  };
}

export function buildMisconceptionLifecycleInput(input: {
  identity: MisconceptionIdentity;
  previous: PreviousMisconceptionRecord | null;
  previousAttempts?: AdaptiveAttempt[];
  currentAttempt: AdaptiveAttempt;
}): { attempts: AdaptiveAttempt[]; occurrenceCount: number } {
  const priorOccurrenceCount = input.previous?.occurrence_count ?? 0;

  if (input.currentAttempt.misconceptionKey !== input.identity.key) {
    return {
      attempts: [...(input.previousAttempts ?? []).filter((attempt) => attempt.isCorrect && attempt.misconceptionKey !== input.identity.key), input.currentAttempt],
      occurrenceCount: priorOccurrenceCount,
    };
  }

  const priorEvidence = Array.from({ length: priorOccurrenceCount }, (_, index) => ({
    id: `prior-${input.identity.key}-${index}`,
    isCorrect: false,
    difficulty: input.currentAttempt.difficulty,
    misconceptionKey: input.identity.key,
  }));

  return { attempts: [...priorEvidence, input.currentAttempt], occurrenceCount: 0 };
}
