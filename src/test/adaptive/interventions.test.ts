import { describe, expect, it } from "vitest";
import { selectIntervention } from "@/domain/adaptive/interventions";

const recent = (weightedAccuracyPercentage: number, attemptsConsidered = 4) => ({ attemptsConsidered, correctCount: 0, accuracyPercentage: weightedAccuracyPercentage, weightedAccuracyPercentage, windowSize: 8 });

describe("selectIntervention", () => {
  it("reinforces after low mastery and weak performance", () => {
    expect(selectIntervention({ mastery: 30, difficulty: 4, recentAccuracy: recent(55), consecutive: { consecutiveCorrect: 0, consecutiveIncorrect: 0 } })).toMatchObject({ type: "reinforce" });
  });

  it("retries after repeated mistakes", () => {
    expect(selectIntervention({ mastery: 50, difficulty: 4, recentAccuracy: recent(65), consecutive: { consecutiveCorrect: 0, consecutiveIncorrect: 2 } })).toMatchObject({ type: "retry" });
  });

  it("challenges after sustained strong performance", () => {
    expect(selectIntervention({ mastery: 75, difficulty: 6, recentAccuracy: recent(90), consecutive: { consecutiveCorrect: 3, consecutiveIncorrect: 0 } })).toMatchObject({ type: "increase-challenge" });
  });

  it("continues for neutral evidence", () => {
    expect(selectIntervention({ mastery: 55, difficulty: 5, recentAccuracy: recent(70), consecutive: { consecutiveCorrect: 1, consecutiveIncorrect: 0 } })).toMatchObject({ type: "continue" });
  });
});
