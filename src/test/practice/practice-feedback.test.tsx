// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PracticeFeedback, type FeedbackResult } from "@/components/practice/practice-feedback";

function engineResult(overrides: Partial<FeedbackResult> = {}): FeedbackResult {
  return {
    correct: false,
    correctAnswer: "b",
    explanation: "Factor pairs of 10 are 1×10 and 2×5; 2+5 = 7.",
    intervention: "retry",
    mastery: 0.5,
    masteryChange: -0.01,
    difficulty: 4,
    difficultyChange: 0,
    recentAccuracy: 0.6,
    adaptationReasonCode: "single_mistake_hint",
    consecutiveCorrect: 0,
    consecutiveIncorrect: 1,
    attemptInserted: true,
    nextQuestion: null,
    nextQuestionReasonCode: "closest_difficulty",
    ...overrides,
  } as FeedbackResult;
}

describe("PracticeFeedback", () => {
  it("offers Try again for a retry intervention", () => {
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({ intervention: "retry" })}
      />,
    );

    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(screen.getByText("Give it another go.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Continue/ })).not.toBeInTheDocument();
  });

  it("reveals a clue for the hint intervention", () => {
    const hint = "Which two numbers multiply to 6 and add to 5?";
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({ intervention: "hint", hint })}
      />,
    );

    expect(screen.getByText("Here's a clue")).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
  });

  it("teaches through a worked-example intervention", () => {
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({
          intervention: "worked-example",
          explanation: "Step one: list factor pairs.",
        })}
      />,
    );

    expect(screen.getByText("Let's work through this one together.")).toBeInTheDocument();
    expect(screen.getByText("Let's work through it")).toBeInTheDocument();
    expect(screen.getByText(/Step one/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
  });

  it("offers a simpler version for the simplify intervention", () => {
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({
          intervention: "simplify",
          explanation: "Try small numbers first.",
        })}
      />,
    );

    expect(screen.getByText("Let's try a simpler version of this.")).toBeInTheDocument();
    expect(screen.getByText("Here's a simpler way")).toBeInTheDocument();
  });

  it("celebrates a correct answer and offers Continue", () => {
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({ correct: true, intervention: "continue" })}
      />,
    );

    expect(screen.getByText("Nice work.")).toBeInTheDocument();
    expect(screen.getByText("You got it right.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Try again/ })).not.toBeInTheDocument();
  });

  it("fires onRetry when Try again is pressed", () => {
    const onRetry = vi.fn();
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={onRetry}
        result={engineResult({ intervention: "retry" })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not reveal the correct answer for a non-reveal wrong answer", () => {
    render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({ intervention: "retry" })}
      />,
    );

    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
    expect(screen.queryByText(/was b/)).not.toBeInTheDocument();
  });

  it("never leaks raw engine metadata or reason codes", () => {
    const { container } = render(
      <PracticeFeedback
        onContinue={() => {}}
        onRetry={() => {}}
        result={engineResult({ intervention: "worked-example" })}
      />,
    );

    const text = container.textContent ?? "";
    const hiddenTokens = [
      "0.5",
      "single_mistake_hint",
      "mastery",
      "difficulty",
      "recentAccuracy",
      "consecutiveIncorrect",
      "attemptInserted",
      "nextQuestionReasonCode",
      "closest_difficulty",
      "worked-example",
    ];

    for (const token of hiddenTokens) {
      expect(text.toLowerCase()).not.toContain(token.toLowerCase());
    }
  });
});