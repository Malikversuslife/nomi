import { relativeWhenLabel } from "@/domain/progress/presentation";
import type { ProfileLearningSummary } from "./types";

export const EXPLANATION_STYLE_VALUES = [
  "step-by-step",
  "conceptual",
  "examples-first",
  "concise",
] as const;

export type ExplanationStyleValue = (typeof EXPLANATION_STYLE_VALUES)[number];

export const EXPLANATION_STYLE_OPTIONS: Array<{
  value: ExplanationStyleValue;
  label: string;
}> = [
  { value: "step-by-step", label: "Step by step" },
  { value: "conceptual", label: "Big picture first" },
  { value: "examples-first", label: "Start with examples" },
  { value: "concise", label: "Keep it short" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function explanationStyleLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return (
    EXPLANATION_STYLE_OPTIONS.find((option) => option.value === value)?.label ?? null
  );
}

export function goalLabel(minutes: number): string {
  const noun = minutes === 1 ? "minute" : "minutes";
  return `${minutes} ${noun} a day`;
}

export function memberSinceLabel(createdAt: string | null): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export type ProfileLearningSummaryInput = {
  learnerSubjects: Array<{ status: string; name?: string | null }>;
  topicProgress: Array<{
    attemptedCount: number;
    lastPracticedAt: string | null;
    topicName: string | null;
  }>;
};

const RECENT_TOPIC_LIMIT = 4;

function toTimestamp(iso: string): number {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export function buildProfileSummary(
  input: ProfileLearningSummaryInput,
  now: Date,
): ProfileLearningSummary {
  const activeSubjects = input.learnerSubjects.filter(
    (subject) => subject.status === "active",
  );

  const activeSubjectNames = activeSubjects
    .map((subject) => subject.name)
    .filter((name): name is string => Boolean(name));

  const topicsTouched = input.topicProgress.length;

  const questionsAnswered = input.topicProgress.reduce(
    (sum, row) => sum + row.attemptedCount,
    0,
  );

  const practiced = [...input.topicProgress]
    .filter((row) => Boolean(row.lastPracticedAt) && Boolean(row.topicName))
    .sort(
      (a, b) =>
        toTimestamp(b.lastPracticedAt as string) -
        toTimestamp(a.lastPracticedAt as string),
    );

  const first = practiced[0];

  const lastPracticedLabel = first?.lastPracticedAt
    ? relativeWhenLabel(first.lastPracticedAt, now)
    : null;

  const recentTopics = practiced.slice(0, RECENT_TOPIC_LIMIT).map((row) => ({
    name: row.topicName as string,
    lastPracticedLabel: relativeWhenLabel(row.lastPracticedAt as string, now),
  }));

  return {
    activeSubjects: activeSubjects.length,
    activeSubjectNames,
    topicsTouched,
    questionsAnswered,
    lastPracticedLabel,
    recentTopics,
  };
}

const plural = (count: number, singular: string) =>
  count === 1 ? singular : `${singular}s`;

export function practisedSentence(summary: ProfileLearningSummary): string {
  if (summary.topicsTouched === 0 && summary.questionsAnswered === 0) {
    return "You haven't started a topic yet.";
  }

  const topicPart = `${summary.topicsTouched} ${plural(summary.topicsTouched, "topic")}`;

  const subjectPart =
    summary.activeSubjectNames.length === 1
      ? ` in ${summary.activeSubjectNames[0]}`
      : "";

  return `You've practised ${topicPart}${subjectPart}.`;
}

export function answeredSentence(summary: ProfileLearningSummary): string {
  if (summary.questionsAnswered === 0) {
    return "No questions answered yet.";
  }

  const answeredPart = `${summary.questionsAnswered} ${plural(
    summary.questionsAnswered,
    "question",
  )} answered`;

  const lastPart = summary.lastPracticedLabel
    ? ` · Last practised ${summary.lastPracticedLabel}`
    : "";

  return `${answeredPart}${lastPart}.`;
}