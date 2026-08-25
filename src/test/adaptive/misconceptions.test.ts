import { describe, expect, it } from "vitest";
import { updateMisconceptionState } from "@/domain/adaptive/misconceptions";

describe("updateMisconceptionState", () => {
  it("marks a first matching incorrect attempt as active", () => {
    expect(updateMisconceptionState({ key: "sign-error", recentAttempts: [{ isCorrect: false, difficulty: 3, misconceptionKey: "sign-error" }] }).status).toBe("active");
  });

  it("marks repeated matching incorrect attempts as recurring", () => {
    expect(updateMisconceptionState({ key: "sign-error", recentAttempts: [{ isCorrect: false, difficulty: 3, misconceptionKey: "sign-error" }, { isCorrect: false, difficulty: 3, misconceptionKey: "sign-error" }] }).status).toBe("recurring");
  });

  it("marks correct attempts after a misconception as improving", () => {
    expect(updateMisconceptionState({ key: "sign-error", currentStatus: "recurring", occurrenceCount: 2, recentAttempts: [{ isCorrect: true, difficulty: 3 }, { isCorrect: true, difficulty: 3 }] }).status).toBe("improving");
  });

  it("marks sustained correct attempts as resolved", () => {
    expect(updateMisconceptionState({ key: "sign-error", currentStatus: "improving", occurrenceCount: 2, recentAttempts: [{ isCorrect: true, difficulty: 3 }, { isCorrect: true, difficulty: 3 }, { isCorrect: true, difficulty: 3 }] }).status).toBe("resolved");
  });
});
