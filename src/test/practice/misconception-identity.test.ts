import { describe, expect, it } from "vitest";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "@/server/practice/misconceptions";

const identity = {
  topicProgressId: "progress-1",
  key: "sign-error-factorisation",
  category: "calculation_error",
};

describe("practice misconception identity", () => {
  it("marks first matching incorrect occurrence as active with count 1", () => {
    const lifecycle = buildMisconceptionLifecycleInput({
      identity,
      previous: null,
      currentAttempt: { isCorrect: false, difficulty: 2, misconceptionKey: identity.key },
    });
    const state = deriveLearnerState({
      currentDifficulty: 2,
      attempts: [{ isCorrect: false, difficulty: 2, misconceptionKey: identity.key }],
      misconceptionAttempts: lifecycle.attempts,
      misconceptionKey: identity.key,
      misconceptionOccurrenceCount: lifecycle.occurrenceCount,
    });

    expect(state.misconceptionSummary?.status).toBe("active");
    expect(state.misconceptionSummary?.occurrenceCount).toBe(1);
  });

  it("marks second matching incorrect occurrence as recurring with count 2", () => {
    const lifecycle = buildMisconceptionLifecycleInput({
      identity,
      previous: { status: "active", occurrence_count: 1 },
      currentAttempt: { isCorrect: false, difficulty: 2, misconceptionKey: identity.key },
    });
    const state = deriveLearnerState({
      currentDifficulty: 2,
      attempts: [{ isCorrect: false, difficulty: 2, misconceptionKey: identity.key }],
      misconceptionAttempts: lifecycle.attempts,
      misconceptionKey: identity.key,
      misconceptionStatus: "active",
      misconceptionOccurrenceCount: lifecycle.occurrenceCount,
    });

    expect(state.misconceptionSummary?.status).toBe("recurring");
    expect(state.misconceptionSummary?.occurrenceCount).toBe(2);
  });

  it("keeps different keys independent", () => {
    const nextIdentity = { ...identity, key: "distribution-error" };
    const lifecycle = buildMisconceptionLifecycleInput({
      identity: nextIdentity,
      previous: null,
      currentAttempt: { isCorrect: false, difficulty: 2, misconceptionKey: nextIdentity.key },
    });
    const state = deriveLearnerState({
      currentDifficulty: 2,
      attempts: [{ isCorrect: false, difficulty: 2, misconceptionKey: nextIdentity.key }],
      misconceptionAttempts: lifecycle.attempts,
      misconceptionKey: nextIdentity.key,
      misconceptionOccurrenceCount: lifecycle.occurrenceCount,
    });

    expect(state.misconceptionSummary).toMatchObject({ key: "distribution-error", status: "active", occurrenceCount: 1 });
  });

  it("treats different categories as separate identities", () => {
    expect(getMisconceptionIdentity({ topicProgressId: "progress-1", misconceptionKey: identity.key, misconceptionCategory: "calculation_error" })).not.toEqual(
      getMisconceptionIdentity({ topicProgressId: "progress-1", misconceptionKey: identity.key, misconceptionCategory: "conceptual_understanding" }),
    );
  });

  it("continues recurring misconceptions into improving and resolved states", () => {
    const improvingLifecycle = buildMisconceptionLifecycleInput({
      identity,
      previous: { status: "recurring", occurrence_count: 2 },
      previousAttempts: [{ isCorrect: true, difficulty: 2 }],
      currentAttempt: { isCorrect: true, difficulty: 2 },
    });
    const improving = deriveLearnerState({
      currentDifficulty: 2,
      attempts: [{ isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 2 }],
      misconceptionAttempts: improvingLifecycle.attempts,
      misconceptionKey: identity.key,
      misconceptionStatus: "recurring",
      misconceptionOccurrenceCount: improvingLifecycle.occurrenceCount,
    });

    const resolved = deriveLearnerState({
      currentDifficulty: 2,
      attempts: [{ isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 2 }],
      misconceptionAttempts: [{ isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 2 }],
      misconceptionKey: identity.key,
      misconceptionStatus: "improving",
      misconceptionOccurrenceCount: 2,
    });

    expect(improving.misconceptionSummary?.status).toBe("improving");
    expect(resolved.misconceptionSummary?.status).toBe("resolved");
  });
});
