import { describe, expect, it } from "vitest";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";

describe("deriveLearnerState", () => {
  it("returns deterministic output for the same input", () => {
    const input = {
      currentMastery: 40,
      currentDifficulty: 4,
      attempts: [
        { isCorrect: false, difficulty: 4, misconceptionKey: "factor-sign" },
        { isCorrect: true, difficulty: 5 },
        { isCorrect: true, difficulty: 5 },
      ],
      misconceptionKey: "factor-sign",
      misconceptionOccurrenceCount: 1,
    };

    expect(deriveLearnerState(input)).toEqual(deriveLearnerState(input));
  });

  it("composes shared learner state consistently", () => {
    const state = deriveLearnerState({
      currentMastery: 50,
      currentDifficulty: 5,
      attempts: [{ isCorrect: true, difficulty: 5 }, { isCorrect: true, difficulty: 5 }, { isCorrect: true, difficulty: 6 }],
    });

    expect(state.mastery).toBeGreaterThan(50);
    expect(state.difficulty).toBe(6);
    expect(state.consecutiveCorrect).toBe(3);
    expect(state.recommendedIntervention.type).toBe("increase-challenge");
  });
});
