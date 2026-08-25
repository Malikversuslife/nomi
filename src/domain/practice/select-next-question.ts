import type { PracticeQuestion } from "./types";

export type NextQuestionSelection = {
  question: PracticeQuestion | null;
  reasonCode: "closest_difficulty" | "avoid_repeat" | "no_available_question";
};

export function selectNextQuestion(input: { questions: PracticeQuestion[]; targetDifficulty: number; previousQuestionId?: string }): NextQuestionSelection {
  const available = input.questions.filter((question) => question.id !== input.previousQuestionId);
  const pool = available.length > 0 ? available : input.questions;

  if (pool.length === 0) {
    return { question: null, reasonCode: "no_available_question" };
  }

  const [question] = [...pool].sort((a, b) => Math.abs(a.difficulty - input.targetDifficulty) - Math.abs(b.difficulty - input.targetDifficulty) || a.difficulty - b.difficulty || a.id.localeCompare(b.id));

  return {
    question,
    reasonCode: question.id !== input.previousQuestionId ? "avoid_repeat" : "closest_difficulty",
  };
}
