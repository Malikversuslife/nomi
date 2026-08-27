import { describe, expect, it } from "vitest";
import {
  deriveTopicState,
  insightMessageForIntervention,
  type LearnTopicProgress,
} from "@/domain/learn/topic-state";

function progress(overrides: Partial<LearnTopicProgress> = {}): LearnTopicProgress {
  return {
    mastery: 40,
    recentAccuracy: 70,
    attemptedCount: 1,
    consecutiveIncorrect: 0,
    ...overrides,
  };
}

describe("deriveTopicState", () => {
  it("maps no progress to not-started", () => {
    const state = deriveTopicState(null);
    expect(state.key).toBe("not-started");
    expect(state.label).toBe("Not started");
    expect(state.cue).toBeNull();
    expect(state.actionLabel).toBe("Practise");
  });

  it("maps repeated misses to needs-practice even when mastery is high", () => {
    const state = deriveTopicState(progress({ mastery: 90, consecutiveIncorrect: 2 }));
    expect(state.key).toBe("needs-practice");
    expect(state.label).toBe("Needs practice");
    expect(state.actionLabel).toBe("Practise again");
  });

  it("maps low recent accuracy to needs-practice", () => {
    const state = deriveTopicState(progress({ recentAccuracy: 40 }));
    expect(state.key).toBe("needs-practice");
  });

  it("maps high mastery to strong", () => {
    const state = deriveTopicState(
      progress({ mastery: 85, recentAccuracy: 92, attemptedCount: 8 }),
    );
    expect(state.key).toBe("strong");
    expect(state.label).toBe("Strong");
  });

  it("maps remaining progress to in-progress", () => {
    const state = deriveTopicState(progress());
    expect(state.key).toBe("in-progress");
    expect(state.label).toBe("In progress");
  });

  it("mentions momentum only after enough attempts", () => {
    const oneAttempt = deriveTopicState(progress({ attemptedCount: 1 }));
    const threeAttempts = deriveTopicState(progress({ attemptedCount: 3 }));
    expect(oneAttempt.cue).toContain("start");
    expect(threeAttempts.cue).toContain("momentum");
  });
});

describe("insightMessageForIntervention", () => {
  it("surfaces a learner-friendly retry suggestion", () => {
    expect(insightMessageForIntervention("retry", "Factorisation")).toBe(
      "Factorisation is worth another quick practice before moving on.",
    );
  });

  it("returns null when there is no meaningful evidence", () => {
    expect(insightMessageForIntervention("continue", "Factorisation")).toBeNull();
    expect(insightMessageForIntervention(null, "Factorisation")).toBeNull();
    expect(insightMessageForIntervention(undefined, "Factorisation")).toBeNull();
  });

  it("returns null for unknown codes", () => {
    expect(insightMessageForIntervention("something-new", "Factorisation")).toBeNull();
  });

  it("never echoes the raw internal intervention code", () => {
    const codes = [
      "retry",
      "hint",
      "simplify",
      "worked-example",
      "review-prerequisite",
      "increase-challenge",
      "reinforce",
      "continue",
    ];

    for (const code of codes) {
      const message = insightMessageForIntervention(code, "Factorisation");
      if (message) {
        expect(message.toLowerCase()).not.toContain(code);
      }
    }
  });
});