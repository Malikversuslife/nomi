import { describe, expect, it } from "vitest";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import type { PracticeQuestion } from "@/domain/practice/types";

const baseQuestion: PracticeQuestion = {
  id: "question-1",
  topicId: "topic-1",
  conceptName: "Factorisation",
  difficulty: 3,
  questionType: "multiple_choice",
  prompt: "Factorise x^2 + 7x + 10.",
  options: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  expectedAnswer: { option_id: "b", accepted: ["(x+2)(x+5)"] },
  explanation: "Use factor pairs.",
  misconceptionKey: "factor-pair-selection",
  misconceptionCategory: "conceptual_understanding",
};

describe("evaluateAnswer", () => {
  it("evaluates correct multiple choice answers", () => {
    expect(evaluateAnswer(baseQuestion, { option_id: "b" })).toMatchObject({ isCorrect: true, misconceptionKey: null });
  });

  it("evaluates incorrect multiple choice answers", () => {
    expect(evaluateAnswer(baseQuestion, { option_id: "a" })).toMatchObject({ isCorrect: false, misconceptionKey: "factor-pair-selection" });
  });

  it("normalizes deterministic short answers", () => {
    const question = { ...baseQuestion, questionType: "short_answer" as const, expectedAnswer: { accepted: ["(x-3)(x+2)"] } };

    expect(evaluateAnswer(question, "(x - 3)(x + 2)")).toMatchObject({ isCorrect: true });
  });
});
