import type { LearnerSafePracticeQuestionWithMeta } from "./questions";

export type PracticeResult = {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  hint?: string;
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
  nextQuestion: LearnerSafePracticeQuestionWithMeta | null;
  nextQuestionReasonCode: string;
};

export type PracticeActionState = {
  question?: LearnerSafePracticeQuestionWithMeta | null;
  result?: PracticeResult;
  message?: string;
};
