import { describe, expect, it } from "vitest";
import { calculateRecentAccuracy } from "@/domain/adaptive/recent-accuracy";
import type { AdaptiveAttempt } from "@/domain/adaptive/types";

const attempt = (isCorrect: boolean): AdaptiveAttempt => ({ isCorrect, difficulty: 3 });

describe("calculateRecentAccuracy", () => {
  it("handles empty attempts", () => {
    expect(calculateRecentAccuracy([])).toMatchObject({ attemptsConsidered: 0, correctCount: 0, accuracyPercentage: 0, weightedAccuracyPercentage: 0 });
  });

  it("handles all correct attempts", () => {
    expect(calculateRecentAccuracy([attempt(true), attempt(true)])).toMatchObject({ attemptsConsidered: 2, correctCount: 2, accuracyPercentage: 100, weightedAccuracyPercentage: 100 });
  });

  it("handles all incorrect attempts", () => {
    expect(calculateRecentAccuracy([attempt(false), attempt(false)])).toMatchObject({ attemptsConsidered: 2, correctCount: 0, accuracyPercentage: 0, weightedAccuracyPercentage: 0 });
  });

  it("handles mixed attempts and weights newer attempts more", () => {
    const result = calculateRecentAccuracy([attempt(false), attempt(true)], 8);

    expect(result.accuracyPercentage).toBe(50);
    expect(result.weightedAccuracyPercentage).toBe(67);
  });
});
