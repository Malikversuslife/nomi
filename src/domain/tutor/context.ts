import type { TutorClientContext, TutorContextInput } from "./types";

const interventionPhrases: Record<string, string> = {
  continue: "recent progress has been steady",
  reinforce: "repeating it is recommended to lock it in",
  simplify: "a simpler approach is likely to help right now",
  "worked-example": "a worked example is likely to help",
  hint: "a small hint is likely to help next",
  retry: "another try at it is recommended",
  "increase-challenge": "they are ready for a slightly harder step",
  "review-prerequisite": "revisiting an earlier idea is recommended",
};

const misconceptionPhrases: Record<string, string | null> = {
  conceptual_understanding: "the confusion looks conceptual rather than a slip",
  calculation_error: "the confusion looks like it involves a calculation step",
  terminology_confusion: "the confusion may involve terminology or notation",
  skipped_step: "a step may have been skipped during problem solving",
  careless_mistake: "recent wrong answers look like careless mistakes rather than gaps",
  missing_prerequisite: "an earlier prerequisite idea may not be fully in place",
  unknown: null,
};

export function interventionContextPhrase(intervention: string | null | undefined): string | null {
  return intervention ? interventionPhrases[intervention] ?? null : null;
}

export function misconceptionContextPhrase(
  category: string | null | undefined,
  status: string | null | undefined,
): string | null {
  if (!category || (status !== "active" && status !== "recurring")) {
    return null;
  }

  return misconceptionPhrases[category] ?? null;
}

export function tutorContextChip(context: TutorClientContext): string | null {
  if (!context.subjectName && !context.topicName) {
    return null;
  }

  if (context.subjectName && context.topicName) {
    return `${context.subjectName} · ${context.topicName}`;
  }

  return context.topicName ?? context.subjectName;
}

export function emptyStateContextLine(context: TutorClientContext): string | null {
  if (!context.topicName) {
    return null;
  }

  return "Want to go through it together?";
}

export function buildTutorContextText(input: TutorContextInput): string {
  const rows: string[] = [];

  if (input.subjectName) {
    rows.push(`Subject: ${input.subjectName}`);
  }
  if (input.topicName) {
    rows.push(`Topic: ${input.topicName}`);
  }
  if (input.gradeYear) {
    rows.push(`Learner grade/year: ${input.gradeYear}`);
  }
  if (input.explanationStyle) {
    rows.push(`Preferred explanation style: ${input.explanationStyle}`);
  }

  const intervention = interventionContextPhrase(input.intervention);
  if (intervention) {
    rows.push(`Recent learner state: ${intervention}.`);
  }

  if (input.recentPracticeCorrect === true) {
    rows.push("Recent practice result: the last answer was marked correct.");
  } else if (input.recentPracticeCorrect === false) {
    rows.push("Recent practice result: the last answer was marked incorrect.");
  }

  const misconception = misconceptionContextPhrase(
    input.misconceptionCategory,
    input.misconceptionStatus,
  );
  if (misconception) {
    rows.push(`Learner misconception note: ${misconception}.`);
  }

  return rows.join("\n");
}