export type Difficulty = number;
export type Mastery = number;

export type AdaptiveAttempt = {
  id?: string;
  isCorrect: boolean;
  difficulty: Difficulty;
  createdAt?: string | Date;
  misconceptionKey?: string | null;
};

export type RecentAccuracy = {
  attemptsConsidered: number;
  correctCount: number;
  accuracyPercentage: number;
  weightedAccuracyPercentage: number;
  windowSize: number;
};

export type ConsecutiveAnswerState = {
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
};

export type DifficultyReasonCode =
  | "no_evidence"
  | "stable"
  | "strong_recent_performance"
  | "sustained_correct_streak"
  | "repeated_mistakes"
  | "high_mastery_stretch"
  | "low_mastery_reinforce"
  | "lower_boundary"
  | "upper_boundary";

export type DifficultyDecision = {
  difficulty: Difficulty;
  previousDifficulty: Difficulty;
  reasonCode: DifficultyReasonCode;
};

export type MisconceptionStatus = "active" | "recurring" | "improving" | "resolved";

export type MisconceptionEvidence = {
  key: string;
  currentStatus?: MisconceptionStatus;
  occurrenceCount?: number;
  recentAttempts: AdaptiveAttempt[];
};

export type MisconceptionState = {
  key: string;
  status: MisconceptionStatus;
  occurrenceCount: number;
  recentIncorrectWithMisconception: number;
  recentCorrectWithoutMisconception: number;
};

export type InterventionType = "continue" | "reinforce" | "simplify" | "worked-example" | "hint" | "retry" | "increase-challenge" | "review-prerequisite";

export type InterventionReasonCode =
  | "no_action_needed"
  | "no_recent_evidence"
  | "single_mistake_hint"
  | "repeated_incorrect_retry"
  | "low_mastery_reinforce"
  | "low_accuracy_simplify"
  | "active_misconception_worked_example"
  | "recurring_misconception_prerequisite"
  | "strong_performance_challenge";

export type InterventionDecision = {
  type: InterventionType;
  reasonCode: InterventionReasonCode;
  metadata: {
    mastery: Mastery;
    difficulty: Difficulty;
    recentAccuracyPercentage: number;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    misconceptionStatus?: MisconceptionStatus;
    misconceptionKey?: string;
  };
};

export type LearnerStateInput = {
  currentMastery?: Mastery;
  currentDifficulty?: Difficulty;
  attempts: AdaptiveAttempt[];
  misconceptionAttempts?: AdaptiveAttempt[];
  misconceptionKey?: string | null;
  misconceptionStatus?: MisconceptionStatus;
  misconceptionOccurrenceCount?: number;
};

export type LearnerState = {
  mastery: Mastery;
  difficulty: Difficulty;
  recentAccuracy: RecentAccuracy;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  misconceptionSummary: MisconceptionState | null;
  recommendedIntervention: InterventionDecision;
  adaptationReasonCode: DifficultyReasonCode | InterventionReasonCode;
};
