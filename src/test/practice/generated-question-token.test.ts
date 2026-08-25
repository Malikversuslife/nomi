import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { openGeneratedQuestion, sealGeneratedQuestion } from "@/server/practice/generated-question-token";

const previousSecret = process.env.NOMI_QUESTION_TOKEN_SECRET;

const question = {
  id: "q1",
  topicId: "topic-1",
  conceptName: "Factor pairs",
  difficulty: 6,
  questionType: "short_answer" as const,
  prompt: "Factorise x^2 + 5x + 6.",
  options: null,
  expectedAnswer: { accepted: ["(x+2)(x+3)"] },
  explanation: "The factor pair 2 and 3 works.",
  misconceptionKey: null,
  misconceptionCategory: null,
};

describe("generated question tokens", () => {
  afterEach(() => {
    process.env.NOMI_QUESTION_TOKEN_SECRET = previousSecret;
  });

  it("seals and opens generated questions without exposing a raw JSON id", () => {
    process.env.NOMI_QUESTION_TOKEN_SECRET = "12345678901234567890123456789012";
    const token = sealGeneratedQuestion({ question, hint: "Use factor pairs." });

    expect(token).toMatch(/^aiq\./);
    expect(token).not.toContain("expectedAnswer");
    expect(openGeneratedQuestion(token!)?.question.expectedAnswer).toEqual(question.expectedAnswer);
  });

  it("disables generated question tokens when no secret is configured", () => {
    delete process.env.NOMI_QUESTION_TOKEN_SECRET;

    expect(sealGeneratedQuestion({ question, hint: "Use factor pairs." })).toBeNull();
  });
});
