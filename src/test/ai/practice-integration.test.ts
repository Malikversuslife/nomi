import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import { selectNextQuestion } from "@/domain/practice/select-next-question";
import { generatePracticeQuestion } from "@/server/ai/questions";
import { classifyMisconception } from "@/server/ai/misconception-classifier";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "@/server/practice/misconceptions";
import type { AiJsonProvider } from "@/server/ai/provider";

describe("AI practice integration", () => {
  it("uses server-selected difficulty for generated questions and adaptive updates", async () => {
    const provider: AiJsonProvider = { generateJson: async () => ({ question_type: "multiple_choice", prompt: "Which expression is equivalent to x^2 + 5x + 6?", options: [{ id: "a", label: "(x + 2)(x + 3)" }, { id: "b", label: "(x - 2)(x - 3)" }, { id: "c", label: "(x + 1)(x + 6)" }], correct_answer: "a", hint: "Use factor pairs.", explanation: "2 and 3 multiply to 6 and add to 5.", concept_name: "Factor pairs", topic_id: "topic-1", topic_name: "Factorisation", difficulty: 6, misconception_candidates: ["factor-pair-selection"] }) };
    const generated = await generatePracticeQuestion({ subjectName: "Mathematics", topicId: "topic-1", topicName: "Factorisation", targetDifficulty: 6, intervention: "increase-challenge", recentSummary: "strong learner" }, provider);
    const evaluation = evaluateAnswer(generated!.question, { option_id: "a" });
    const state = deriveLearnerState({ currentMastery: 60, currentDifficulty: 6, attempts: [{ isCorrect: evaluation.isCorrect, difficulty: generated!.question.difficulty }] });

    expect(generated?.question.difficulty).toBe(6);
    expect(evaluation.isCorrect).toBe(true);
    expect(state.mastery).toBeGreaterThan(60);
  });

  it("lets classifier output feed deterministic lifecycle without deciding status", async () => {
    const provider: AiJsonProvider = { generateJson: async () => ({ category: "calculation_error", misconception_key: "sign-error-factorisation", concept_name: "Sign handling", confidence: 0.82, evidence_summary: "Confuses signs when choosing factors." }) };
    const classification = await classifyMisconception({ subjectName: "Mathematics", topicName: "Factorisation", conceptName: "Sign handling", questionPrompt: "Factorise x^2 + 5x + 6.", correctAnswer: { accepted: ["(x+2)(x+3)"] }, learnerAnswer: { value: "(x-2)(x-3)" }, candidateKeys: [] }, provider);
    const identity = getMisconceptionIdentity({ topicProgressId: "progress-1", misconceptionKey: classification!.misconception_key, misconceptionCategory: classification!.category });
    const lifecycle = buildMisconceptionLifecycleInput({ identity: identity!, previous: { status: "active", occurrence_count: 1 }, currentAttempt: { isCorrect: false, difficulty: 4, misconceptionKey: classification!.misconception_key } });
    const state = deriveLearnerState({ currentDifficulty: 4, attempts: lifecycle.attempts, misconceptionAttempts: lifecycle.attempts, misconceptionKey: classification!.misconception_key, misconceptionStatus: "active", misconceptionOccurrenceCount: lifecycle.occurrenceCount });

    expect(classification).not.toHaveProperty("status");
    expect(state.misconceptionSummary?.status).toBe("recurring");
  });

  it("falls back to seeded selection when generation fails", async () => {
    const provider: AiJsonProvider = { generateJson: async () => Promise.reject(new Error("down")) };
    const generated = await generatePracticeQuestion({ subjectName: "Mathematics", topicId: "topic-1", topicName: "Factorisation", targetDifficulty: 5, intervention: "continue", recentSummary: "steady" }, provider);
    const fallback = selectNextQuestion({ questions: [{ id: "seeded", topicId: "topic-1", conceptName: "Factor pairs", difficulty: 5, questionType: "short_answer", prompt: "Factorise x^2 + 5x + 6.", options: null, expectedAnswer: { accepted: ["(x+2)(x+3)"] }, explanation: "Use factor pairs.", misconceptionKey: "sign-error", misconceptionCategory: "calculation_error" }], targetDifficulty: 5 });

    expect(generated).toBeNull();
    expect(fallback.question?.id).toBe("seeded");
  });

  it("uses safe fallback when classification fails", async () => {
    const provider: AiJsonProvider = { generateJson: async () => Promise.reject(new Error("down")) };

    await expect(classifyMisconception({ subjectName: "Mathematics", topicName: "Factorisation", conceptName: "Factor pairs", questionPrompt: "Factorise x^2 + 5x + 6.", correctAnswer: { accepted: ["(x+2)(x+3)"] }, learnerAnswer: { value: "wrong" }, candidateKeys: ["unknown"] }, provider)).resolves.toBeNull();
  });
});
