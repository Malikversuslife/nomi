import { describe, expect, it } from "vitest";
import { decideDifficulty } from "@/domain/adaptive/difficulty";

const recent = (weightedAccuracyPercentage: number, attemptsConsidered = 4) => ({ attemptsConsidered, correctCount: 0, accuracyPercentage: weightedAccuracyPercentage, weightedAccuracyPercentage, windowSize: 8 });

describe("decideDifficulty", () => {
  it("stays stable for neutral evidence", () => {
    expect(decideDifficulty({ currentDifficulty: 5, mastery: 50, recentAccuracy: recent(65), consecutive: { consecutiveCorrect: 1, consecutiveIncorrect: 0 } })).toMatchObject({ difficulty: 5, reasonCode: "stable" });
  });

  it("increases after sustained strong performance", () => {
    expect(decideDifficulty({ currentDifficulty: 5, mastery: 70, recentAccuracy: recent(90), consecutive: { consecutiveCorrect: 2, consecutiveIncorrect: 0 } })).toMatchObject({ difficulty: 6, reasonCode: "strong_recent_performance" });
  });

  it("decreases after repeated mistakes", () => {
    expect(decideDifficulty({ currentDifficulty: 5, mastery: 50, recentAccuracy: recent(30), consecutive: { consecutiveCorrect: 0, consecutiveIncorrect: 2 } })).toMatchObject({ difficulty: 4, reasonCode: "repeated_mistakes" });
  });

  it("respects lower boundary", () => {
    expect(decideDifficulty({ currentDifficulty: 1, mastery: 20, recentAccuracy: recent(20), consecutive: { consecutiveCorrect: 0, consecutiveIncorrect: 3 } })).toMatchObject({ difficulty: 1, reasonCode: "lower_boundary" });
  });

  it("respects upper boundary", () => {
    expect(decideDifficulty({ currentDifficulty: 10, mastery: 95, recentAccuracy: recent(90), consecutive: { consecutiveCorrect: 4, consecutiveIncorrect: 0 } })).toMatchObject({ difficulty: 10, reasonCode: "upper_boundary" });
  });
});
