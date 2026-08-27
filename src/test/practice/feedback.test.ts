import { describe, expect, it } from "vitest";
import {
  feedbackCopy,
  guidanceForResult,
  reactionForResult,
} from "@/components/practice/feedback";

describe("feedbackCopy", () => {
  it("keeps correct + continue cohesive", () => {
    const copy = feedbackCopy({ correct: true, intervention: "continue" });
    expect(copy.title).toBe("Nice work.");
    expect(copy.message).toBe("You got it right.");
  });

  it("explains why after a reinforcing correct answer", () => {
    const copy = feedbackCopy({ correct: true, intervention: "reinforce" });
    expect(copy.message).toBe(
      "You got it right. Let's do one more like this to make sure the pattern sticks.",
    );
  });

  it("frames increased challenge for a strong correct answer", () => {
    const copy = feedbackCopy({ correct: true, intervention: "increase-challenge" });
    expect(copy.message).toContain("ready for something tougher");
  });

  it("frames worked-example for a correct answer with active misconception", () => {
    const copy = feedbackCopy({ correct: true, intervention: "worked-example" });
    expect(copy.message).toContain("working through one together");
  });

  it.each([
    ["retry", "Give it another go."],
    ["continue", "Give it another go."],
    ["reinforce", "Give it another go."],
  ])("uses gentle retry copy for incorrect %s", (intervention, expected) => {
    const copy = feedbackCopy({ correct: false, intervention });
    expect(copy.title).toBe("Not quite.");
    expect(copy.message).toBe(expected);
  });

  it("offers a clue for the hint intervention", () => {
    const copy = feedbackCopy({ correct: false, intervention: "hint" });
    expect(copy.message).toBe("Let me give you a clue to work with.");
  });

  it("teaches for the worked-example intervention", () => {
    const copy = feedbackCopy({ correct: false, intervention: "worked-example" });
    expect(copy.message).toBe("Let's work through this one together.");
  });

  it("offers a simpler version for the simplify intervention", () => {
    const copy = feedbackCopy({ correct: false, intervention: "simplify" });
    expect(copy.message).toBe("Let's try a simpler version of this.");
  });

  it("explains the prerequisite gap for review-prerequisite", () => {
    const copy = feedbackCopy({ correct: false, intervention: "review-prerequisite" });
    expect(copy.message).toContain("earlier idea");
  });

  it("falls back to retry copy for unknown interventions", () => {
    expect(feedbackCopy({ correct: false, intervention: "unknown-code" }).message).toBe(
      "Give it another go.",
    );
  });

  it("never leaks raw engine codes in feedback copy", () => {
    const raw = ["retry", "hint", "worked-example", "simplify", "review-prerequisite", "increase-challenge"];
    for (const code of raw) {
      const copy = [...feedbackCopy({ correct: true, intervention: code }).message,
        feedbackCopy({ correct: false, intervention: code }).message].join(" ");
      expect(copy).not.toContain(code);
      expect(copy).not.toContain("reasonCode");
    }
  });
});

describe("guidanceForResult", () => {
  it("returns a clue for the hint intervention", () => {
    const guidance = guidanceForResult({
      correct: false,
      intervention: "hint",
      hint: "Look at the factor pairs.",
      explanation: "Full explanation.",
    });
    expect(guidance).toEqual({ kind: "hint", text: "Look at the factor pairs." });
  });

  it("falls back to the explanation when no dedicated hint exists", () => {
    const guidance = guidanceForResult({
      correct: false,
      intervention: "hint",
      explanation: "We need factor pairs.",
    });
    expect(guidance).toEqual({ kind: "hint", text: "We need factor pairs." });
  });

  it("returns teaching guidance for worked-example", () => {
    const guidance = guidanceForResult({
      correct: false,
      intervention: "worked-example",
      explanation: "Step by step.",
    });
    expect(guidance).toEqual({ kind: "worked-example", text: "Step by step." });
  });

  it("returns simplified guidance for simplify", () => {
    const guidance = guidanceForResult({
      correct: false,
      intervention: "simplify",
      explanation: "A simpler approach.",
    });
    expect(guidance).toEqual({ kind: "simplify", text: "A simpler approach." });
  });

  it("returns no guidance for retry or continue", () => {
    expect(guidanceForResult({ correct: false, intervention: "retry" })).toBeNull();
    expect(guidanceForResult({ correct: true, intervention: "continue" })).toBeNull();
  });
});

describe("reactionForResult", () => {
  it("celebrates long correct streaks", () => {
    expect(
      reactionForResult({ correct: true, intervention: "continue", consecutiveCorrect: 3 }),
    ).toBe("celebrating");
  });

  it("shows challenge when difficulty increased", () => {
    expect(
      reactionForResult({
        correct: true,
        intervention: "increase-challenge",
        consecutiveCorrect: 3,
        difficultyChange: 1,
      }),
    ).toBe("challenge");
  });

  it("encourages ordinary correct answers", () => {
    expect(reactionForResult({ correct: true, intervention: "continue", consecutiveCorrect: 1 })).toBe(
      "encouraging",
    );
  });

  it("thinks while offering a hint", () => {
    expect(reactionForResult({ correct: false, intervention: "hint" })).toBe("thinking");
  });

  it("reinforces while explaining", () => {
    expect(reactionForResult({ correct: false, intervention: "worked-example" })).toBe("reinforcing");
    expect(reactionForResult({ correct: false, intervention: "reinforce" })).toBe("reinforcing");
  });

  it("supports other incorrect answers", () => {
    expect(reactionForResult({ correct: false, intervention: "retry" })).toBe("supportive");
  });
});