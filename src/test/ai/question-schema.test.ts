import { describe, expect, it } from "vitest";
import { aiGeneratedQuestionSchema, toPracticeQuestion, validateTopicIntegrity } from "@/server/ai/schemas";

const validMultipleChoice = {
  question_type: "multiple_choice",
  prompt: "Which factorisation is equivalent to x^2 + 5x + 6?",
  options: [
    { id: "a", label: "(x + 2)(x + 3)" },
    { id: "b", label: "(x - 2)(x - 3)" },
    { id: "c", label: "(x + 1)(x + 6)" },
  ],
  correct_answer: "a",
  hint: "Find two numbers that multiply to 6 and add to 5.",
  explanation: "The numbers 2 and 3 multiply to 6 and add to 5, so the factorisation is (x + 2)(x + 3).",
  concept_name: "Factorising quadratics",
  topic_id: "topic-1",
  topic_name: "Quadratic equations",
  difficulty: 6,
  misconception_candidates: ["factor-pair-selection"],
};

describe("AI question schema", () => {
  it("accepts valid multiple-choice output", () => {
    expect(aiGeneratedQuestionSchema.safeParse(validMultipleChoice).success).toBe(true);
  });

  it("rejects a multiple-choice answer missing from options", () => {
    expect(aiGeneratedQuestionSchema.safeParse({ ...validMultipleChoice, correct_answer: "z" }).success).toBe(false);
  });

  it("rejects malformed options and hidden reasoning fields", () => {
    expect(aiGeneratedQuestionSchema.safeParse({ ...validMultipleChoice, options: [{ id: "a", label: "" }, { id: "b", label: "B" }, { id: "c", label: "C" }], hidden_reasoning: "no" }).success).toBe(false);
  });

  it("protects authoritative topic identity", () => {
    const parsed = aiGeneratedQuestionSchema.parse(validMultipleChoice);

    expect(validateTopicIntegrity({ generated: parsed, topicId: "topic-1", topicName: "Quadratic equations", targetDifficulty: 6 })).toBe(true);
    expect(validateTopicIntegrity({ generated: parsed, topicId: "topic-2", topicName: "Quadratic equations", targetDifficulty: 6 })).toBe(false);
  });

  it("keeps difficulty server-controlled", () => {
    const parsed = aiGeneratedQuestionSchema.parse({ ...validMultipleChoice, difficulty: 8 });

    expect(validateTopicIntegrity({ generated: parsed, topicId: "topic-1", topicName: "Quadratic equations", targetDifficulty: 6 })).toBe(false);
    expect(toPracticeQuestion({ id: "q1", topicId: "topic-1", targetDifficulty: 6, generated: parsed }).difficulty).toBe(6);
  });
});
