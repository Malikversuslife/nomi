import { describe, expect, it } from "vitest";
import { deriveConsecutiveAnswerState, updateConsecutiveAnswerState } from "@/domain/adaptive/consecutive-state";

describe("consecutive answer state", () => {
  it("tracks correct streaks", () => {
    expect(deriveConsecutiveAnswerState([{ isCorrect: true, difficulty: 2 }, { isCorrect: true, difficulty: 3 }])).toEqual({ consecutiveCorrect: 2, consecutiveIncorrect: 0 });
  });

  it("tracks incorrect streaks", () => {
    expect(deriveConsecutiveAnswerState([{ isCorrect: false, difficulty: 2 }, { isCorrect: false, difficulty: 3 }])).toEqual({ consecutiveCorrect: 0, consecutiveIncorrect: 2 });
  });

  it("resets when answer state changes", () => {
    expect(updateConsecutiveAnswerState({ consecutiveCorrect: 3, consecutiveIncorrect: 0 }, false)).toEqual({ consecutiveCorrect: 0, consecutiveIncorrect: 1 });
  });
});
