import type { LearnerSafePracticeQuestion } from "./questions";

export type PracticeResult = {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  mastery: number;
  masteryChange: number;
  difficulty: number;
  difficultyChange: number;
  recentAccuracy: number;
  intervention: string;
  adaptationReasonCode: string;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  attemptInserted: boolean;
  nextQuestion: LearnerSafePracticeQuestion | null;
  nextQuestionReasonCode: string;
};

export type PracticeActionState = {
  question?: LearnerSafePracticeQuestion | null;
  result?: PracticeResult;
  message?: string;
};
