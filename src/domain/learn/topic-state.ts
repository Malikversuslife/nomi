export type LearnTopicStateKey = "not-started" | "in-progress" | "needs-practice" | "strong";

export type LearnTopicProgress = {
  mastery: number;
  recentAccuracy: number;
  attemptedCount: number;
  consecutiveIncorrect: number;
};

export type LearnTopicStatePresentation = {
  key: LearnTopicStateKey;
  label: string;
  cue: string | null;
  actionLabel: string;
};

const PRACTICE_AGAIN_CONSECUTIVE_INCORRECT = 2;
const PRACTICE_AGAIN_ACCURACY_BELOW = 50;
const STRONG_MASTERY_AT_LEAST = 80;
const MOMENTUM_ATTEMPT_COUNT = 3;

export function deriveTopicState(
  progress: LearnTopicProgress | null,
): LearnTopicStatePresentation {
  if (!progress) {
    return {
      key: "not-started",
      label: "Not started",
      cue: null,
      actionLabel: "Practise",
    };
  }

  if (
    progress.consecutiveIncorrect >= PRACTICE_AGAIN_CONSECUTIVE_INCORRECT ||
    progress.recentAccuracy < PRACTICE_AGAIN_ACCURACY_BELOW
  ) {
    return {
      key: "needs-practice",
      label: "Needs practice",
      cue: "A few recent answers went sideways — one more go will settle the pattern.",
      actionLabel: "Practise again",
    };
  }

  if (progress.mastery >= STRONG_MASTERY_AT_LEAST) {
    return {
      key: "strong",
      label: "Strong",
      cue: "You're in great shape here — a quick review keeps it fresh.",
      actionLabel: "Practise",
    };
  }

  return {
    key: "in-progress",
    label: "In progress",
    cue:
      progress.attemptedCount >= MOMENTUM_ATTEMPT_COUNT
        ? "You're building momentum — keep it up."
        : "You've made a start.",
    actionLabel: "Practise",
  };
}

export function insightMessageForIntervention(
  intervention: string | null | undefined,
  topicName: string,
): string | null {
  switch (intervention) {
    case "retry":
      return `${topicName} is worth another quick practice before moving on.`;
    case "hint":
      return `A quick clue will help you settle ${topicName}.`;
    case "simplify":
      return `Let's try ${topicName} from an easier angle.`;
    case "worked-example":
      return `Working through ${topicName} together, step by step, will help it stick.`;
    case "review-prerequisite":
      return `${topicName} builds on an earlier idea — a quick revisit will help.`;
    case "increase-challenge":
      return `You're ready for something tougher in ${topicName}.`;
    case "reinforce":
      return `Let's lock in ${topicName} with a little more practice.`;
    default:
      return null;
  }
}