import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { classifyMisconception } from "@/server/ai/misconception-classifier";
import type { AiJsonProvider } from "@/server/ai/provider";
import { misconceptionClassificationSchema } from "@/server/ai/schemas";

const input = {
  subjectName: "Mathematics",
  topicName: "Factorisation",
  conceptName: "Factor pairs",
  questionPrompt: "Factorise x^2 + 5x + 6.",
  correctAnswer: { accepted: ["(x+2)(x+3)"] },
  learnerAnswer: { value: "(x-2)(x-3)" },
  candidateKeys: ["sign-error-factorisation"],
};

describe("AI misconception classifier", () => {
  it("accepts approved categories", async () => {
    const provider: AiJsonProvider = { generateJson: async () => ({ category: "calculation_error", misconception_key: "sign-error-factorisation", concept_name: "Factor pairs", confidence: 0.8, evidence_summary: "Confuses signs when choosing factor pairs." }) };

    await expect(classifyMisconception(input, provider)).resolves.toMatchObject({ category: "calculation_error", misconception_key: "sign-error-factorisation" });
  });

  it("maps arbitrary categories safely to unknown", () => {
    expect(misconceptionClassificationSchema.parse({ category: "made_up", misconception_key: "unknown", concept_name: "Factor pairs", confidence: 0.7, evidence_summary: "Answer does not match the expected factor pair." }).category).toBe("unknown");
  });

  it("rejects lifecycle decisions from AI", () => {
    expect(misconceptionClassificationSchema.safeParse({ category: "calculation_error", misconception_key: "sign-error", concept_name: "Signs", confidence: 0.7, evidence_summary: "Confuses sign changes.", lifecycle_status: "recurring" }).success).toBe(false);
  });

  it("fails safely on classifier errors", async () => {
    const provider: AiJsonProvider = { generateJson: async () => Promise.reject(new Error("down")) };

    await expect(classifyMisconception(input, provider)).resolves.toBeNull();
  });
});
