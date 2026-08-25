import { z } from "zod";
import type { PracticeQuestion } from "@/domain/practice/types";

export const approvedMisconceptionCategories = ["conceptual_understanding", "calculation_error", "terminology_confusion", "skipped_step", "careless_mistake", "missing_prerequisite", "unknown"] as const;

const forbiddenKeyPattern = /chain[_-]?of[_-]?thought|hidden[_-]?reasoning|reasoning/i;

function containsForbiddenKey(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(containsForbiddenKey);
  }

  return Object.entries(value).some(([key, nested]) => forbiddenKeyPattern.test(key) || containsForbiddenKey(nested));
}

const optionSchema = z.object({ id: z.string().trim().min(1).max(24), label: z.string().trim().min(1).max(120) }).strict();

export const aiGeneratedQuestionSchema = z
  .object({
    question_type: z.enum(["multiple_choice", "short_answer"]),
    prompt: z.string().trim().min(8).max(600),
    options: z.array(optionSchema).min(3).max(5).nullable(),
    correct_answer: z.string().trim().min(1).max(120),
    accepted_answers: z.array(z.string().trim().min(1).max(120)).min(1).max(4).optional(),
    hint: z.string().trim().min(4).max(220),
    explanation: z.string().trim().min(8).max(500),
    concept_name: z.string().trim().min(1).max(120),
    topic_id: z.string().optional(),
    topic_name: z.string().optional(),
    difficulty: z.number().int().min(1).max(10).optional(),
    misconception_candidates: z.array(z.string().trim().min(1).max(80)).max(5).default([]),
  })
  .strict()
  .superRefine((question, context) => {
    if (containsForbiddenKey(question)) {
      context.addIssue({ code: "custom", message: "Hidden reasoning fields are not allowed." });
    }

    if (question.question_type === "multiple_choice") {
      const optionIds = new Set(question.options?.map((option) => option.id) ?? []);

      if (!question.options || optionIds.size !== question.options.length) {
        context.addIssue({ code: "custom", message: "Multiple-choice options must be unique." });
      }

      if (!optionIds.has(question.correct_answer)) {
        context.addIssue({ code: "custom", message: "Multiple-choice correct answer must match an option id." });
      }
    }

    if (question.question_type === "short_answer" && question.options !== null) {
      context.addIssue({ code: "custom", message: "Short-answer questions must not include options." });
    }
  });

export const misconceptionClassificationSchema = z
  .object({
    category: z.enum(approvedMisconceptionCategories).catch("unknown"),
    misconception_key: z.string().trim().min(1).max(100),
    concept_name: z.string().trim().min(1).max(120),
    confidence: z.number().min(0).max(1),
    evidence_summary: z.string().trim().min(4).max(180),
    lifecycle_status: z.never().optional(),
    status: z.never().optional(),
  })
  .strip()
  .superRefine((classification, context) => {
    if (containsForbiddenKey(classification)) {
      context.addIssue({ code: "custom", message: "Hidden reasoning fields are not allowed." });
    }
  });

export type AiGeneratedQuestion = z.infer<typeof aiGeneratedQuestionSchema>;
export type MisconceptionClassification = z.infer<typeof misconceptionClassificationSchema>;

export function toPracticeQuestion(input: { id: string; topicId: string; targetDifficulty: number; generated: AiGeneratedQuestion }): PracticeQuestion {
  return {
    id: input.id,
    topicId: input.topicId,
    conceptName: input.generated.concept_name,
    difficulty: input.targetDifficulty,
    questionType: input.generated.question_type,
    prompt: input.generated.prompt,
    options: input.generated.question_type === "multiple_choice" ? input.generated.options : null,
    expectedAnswer: input.generated.question_type === "multiple_choice" ? { option_id: input.generated.correct_answer } : { accepted: input.generated.accepted_answers ?? [input.generated.correct_answer] },
    explanation: input.generated.explanation,
    misconceptionKey: input.generated.misconception_candidates[0] ?? null,
    misconceptionCategory: null,
  };
}

export function validateTopicIntegrity(input: { generated: AiGeneratedQuestion; topicId: string; topicName: string; targetDifficulty: number }) {
  if (input.generated.topic_id && input.generated.topic_id !== input.topicId) {
    return false;
  }

  if (input.generated.topic_name && input.generated.topic_name.trim().toLowerCase() !== input.topicName.trim().toLowerCase()) {
    return false;
  }

  return !input.generated.difficulty || input.generated.difficulty === input.targetDifficulty;
}
