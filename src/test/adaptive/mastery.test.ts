import { describe, expect, it } from "vitest";
import { calculateMastery } from "@/domain/adaptive/mastery";
import type { AdaptiveAttempt } from "@/domain/adaptive/types";

const a = (isCorrect: boolean, difficulty: number): AdaptiveAttempt => ({ isCorrect, difficulty });

describe("calculateMastery", () => {
  it("keeps current mastery with no attempts", () => {
    expect(calculateMastery(42, []).mastery).toBe(42);
  });

  it("raises mastery after a first correct answer", () => {
    expect(calculateMastery(0, [a(true, 3)]).mastery).toBeGreaterThan(0);
  });

  it("keeps first incorrect answer bounded at zero", () => {
    expect(calculateMastery(0, [a(false, 3)]).mastery).toBe(0);
  });

  it("applies diminishing impact to repeated easy correct answers at high mastery", () => {
    const easy = calculateMastery(78, [a(true, 2)]).delta;
    const hard = calculateMastery(78, [a(true, 8)]).delta;

    expect(easy).toBeLessThan(hard);
  });

  it("rewards correct harder answers more", () => {
    expect(calculateMastery(40, [a(true, 8)]).delta).toBeGreaterThan(calculateMastery(40, [a(true, 2)]).delta);
  });

  it("handles mixed history deterministically", () => {
    const attempts = [a(true, 4), a(false, 4), a(true, 5), a(true, 6)];

    expect(calculateMastery(30, attempts)).toEqual(calculateMastery(30, attempts));
  });

  it("reflects recent improvement", () => {
    const result = calculateMastery(40, [a(false, 4), a(false, 4), a(true, 6), a(true, 6), a(true, 7)]);

    expect(result.mastery).toBeGreaterThan(40);
  });

  it("reflects recent decline without erasing substantial mastery", () => {
    const result = calculateMastery(82, [a(false, 7), a(false, 7)]);

    expect(result.mastery).toBeLessThan(82);
    expect(result.mastery).toBeGreaterThan(65);
  });

  it("clamps at 0 and 100", () => {
    expect(calculateMastery(1, [a(false, 10), a(false, 10)]).mastery).toBe(0);
    expect(calculateMastery(99, [a(true, 10), a(true, 10)]).mastery).toBe(100);
  });
});
