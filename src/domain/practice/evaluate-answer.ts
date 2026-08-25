import type { Json } from "@/server/supabase/types";
import type { AnswerEvaluation, PracticeQuestion } from "./types";

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[{}]/g, "").trim();
}

function asRecord(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function evaluateAnswer(question: PracticeQuestion, learnerAnswer: unknown): AnswerEvaluation {
  const expected = asRecord(question.expectedAnswer);

  if (question.questionType === "multiple_choice") {
    const selectedOptionId = typeof learnerAnswer === "string" ? learnerAnswer : asRecord(learnerAnswer as Json).option_id;
    const isCorrect = typeof selectedOptionId === "string" && selectedOptionId === expected.option_id;

    return {
      isCorrect,
      normalizedLearnerAnswer: { option_id: typeof selectedOptionId === "string" ? selectedOptionId : "" },
      misconceptionKey: isCorrect ? null : question.misconceptionKey,
      misconceptionCategory: isCorrect ? null : question.misconceptionCategory,
    };
  }

  const answerText = typeof learnerAnswer === "string" ? learnerAnswer : String(asRecord(learnerAnswer as Json).value ?? "");
  const accepted = Array.isArray(expected.accepted) ? expected.accepted : [];
  const isCorrect = accepted.some((answer) => typeof answer === "string" && normalizeText(answer) === normalizeText(answerText));

  return {
    isCorrect,
    normalizedLearnerAnswer: { value: answerText.trim() },
    misconceptionKey: isCorrect ? null : question.misconceptionKey,
    misconceptionCategory: isCorrect ? null : question.misconceptionCategory,
  };
}
