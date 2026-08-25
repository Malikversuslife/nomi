import type { Json } from "@/server/supabase/types";

export type QuestionType = "multiple_choice" | "short_answer";

export type PracticeQuestion = {
  id: string;
  topicId: string;
  conceptName: string;
  difficulty: number;
  questionType: QuestionType;
  prompt: string;
  options: { id: string; label: string }[] | null;
  expectedAnswer: Json;
  explanation: string;
  misconceptionKey: string | null;
  misconceptionCategory: string | null;
};

export type AnswerEvaluation = {
  isCorrect: boolean;
  normalizedLearnerAnswer: Json;
  misconceptionKey: string | null;
  misconceptionCategory: string | null;
};
