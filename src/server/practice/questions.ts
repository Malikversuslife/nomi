import "server-only";
import type { PracticeQuestion as DomainPracticeQuestion } from "@/domain/practice/types";
import type { Json, PracticeQuestion } from "@/server/supabase/types";

export type LearnerSafePracticeQuestion = Omit<DomainPracticeQuestion, "expectedAnswer" | "explanation" | "misconceptionKey" | "misconceptionCategory">;

function mapOptions(options: Json | null): DomainPracticeQuestion["options"] {
  if (!Array.isArray(options)) {
    return null;
  }

  return options.flatMap((option) => {
    if (!option || typeof option !== "object" || Array.isArray(option)) {
      return [];
    }

    const id = option.id;
    const label = option.label;

    return typeof id === "string" && typeof label === "string" ? [{ id, label }] : [];
  });
}

export function mapPracticeQuestion(row: PracticeQuestion): DomainPracticeQuestion {
  return {
    id: row.id,
    topicId: row.topic_id,
    conceptName: row.concept_name,
    difficulty: row.difficulty,
    questionType: row.question_type,
    prompt: row.prompt,
    options: mapOptions(row.options),
    expectedAnswer: row.expected_answer,
    explanation: row.explanation,
    misconceptionKey: row.misconception_key,
    misconceptionCategory: row.misconception_category,
  };
}

export function toLearnerSafeQuestion(question: DomainPracticeQuestion): LearnerSafePracticeQuestion {
  return {
    id: question.id,
    topicId: question.topicId,
    conceptName: question.conceptName,
    difficulty: question.difficulty,
    questionType: question.questionType,
    prompt: question.prompt,
    options: question.options,
  };
}
