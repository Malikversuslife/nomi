import { relativeWhenLabel } from "@/domain/progress/presentation";

export type HomeRecommendation =
  | "continue"
  | "reinforce"
  | "simplify"
  | "worked_example"
  | "hint"
  | "retry"
  | "increase_challenge"
  | "review_prerequisite";

export type HomeRecentLearningItem = {
  topic: string;
  lastPracticedLabel: string;
};

export type HomeViews = {
  recentTopicNames: string[];
  recentLearning: HomeRecentLearningItem[];
  recommendation: { intervention: HomeRecommendation; topicName: string } | null;
};

type HomeRecord = {
  lastPracticedAt: string | null;
  topicName: string | null;
  recommendedIntervention: string | null;
};

const RECENT_LEARNING_LIMIT = 4;

const interventionMap: Record<string, HomeRecommendation | undefined> = {
  reinforce: "reinforce",
  review: "review_prerequisite",
  remediation: "simplify",
  guided_practice: "worked_example",
  challenge: "increase_challenge",
  standard_practice: "continue",
};

function readTopicName(topics: unknown): string | null {
  if (Array.isArray(topics)) {
    const first = topics[0];

    if (first && typeof first === "object") {
      const name = (first as Record<string, unknown>).name;
      return typeof name === "string" ? name : null;
    }

    return null;
  }

  if (topics && typeof topics === "object") {
    const name = (topics as Record<string, unknown>).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}

export function readHomeRecord(record: unknown): HomeRecord | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const value = record as Record<string, unknown>;

  const lastPracticedAt =
    typeof value.last_practiced_at === "string" ? value.last_practiced_at : null;
  const recommendedIntervention =
    typeof value.recommended_intervention === "string"
      ? value.recommended_intervention
      : null;

  return {
    lastPracticedAt,
    topicName: readTopicName(value.topics),
    recommendedIntervention,
  };
}

export function mapHomeIntervention(
  value: string | null | undefined,
): HomeRecommendation | undefined {
  if (!value) {
    return undefined;
  }

  return interventionMap[value];
}

function toTimestamp(iso: string): number {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export function deriveHomeViews(records: unknown[], now: Date): HomeViews {
  const parsed = records
    .map(readHomeRecord)
    .filter((record): record is HomeRecord => record !== null);

  const ordered = [...parsed].sort(
    (a, b) =>
      toTimestamp(b.lastPracticedAt ?? "") - toTimestamp(a.lastPracticedAt ?? ""),
  );

  const recentTopicNames: string[] = [];
  const recentLearning: HomeRecentLearningItem[] = [];

  for (const record of ordered) {
    const name = record.topicName;

    if (name && !recentTopicNames.includes(name)) {
      recentTopicNames.push(name);

      if (record.lastPracticedAt && recentLearning.length < RECENT_LEARNING_LIMIT) {
        recentLearning.push({
          topic: name,
          lastPracticedLabel: relativeWhenLabel(record.lastPracticedAt, now),
        });
      }
    }
  }

  const first = ordered[0];
  const intervention = mapHomeIntervention(first?.recommendedIntervention);

  const recommendation =
    first && intervention
      ? { intervention, topicName: first.topicName ?? "" }
      : null;

  return { recentTopicNames, recentLearning, recommendation };
}