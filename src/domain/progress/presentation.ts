import {
  deriveTopicState,
  insightMessageForIntervention,
  type LearnTopicProgress,
  type LearnTopicStateKey,
} from "@/domain/learn/topic-state";
import type {
  NextUpView,
  ProgressOverview,
  RecentLearningItem,
  SubjectProgressView,
  TopicProgressView,
} from "./types";

export type SubjectMeta = {
  slug: string;
  name: string;
  iconKey: string | null;
};

export type ProgressTopicEvidence = {
  topicId: string;
  subjectId: string;
  slug: string;
  name: string;
  parentName: string | null;
  subjectName: string;
  progress: LearnTopicProgress | null;
  lastPracticedAt: string | null;
};

export type RecentAttemptEvidence = {
  topicNameSnapshot: string | null;
  conceptName: string | null;
  isCorrect: boolean | null;
  createdAt: string;
};

const STATE_PRIORITY: Record<LearnTopicStateKey, number> = {
  "needs-practice": 0,
  "in-progress": 1,
  strong: 2,
  "not-started": 3,
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function statePriority(state: LearnTopicStateKey): number {
  return STATE_PRIORITY[state];
}

export function deriveTopicViews(
  topics: ProgressTopicEvidence[],
): TopicProgressView[] {
  return topics.map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    subjectName: topic.subjectName,
    parentName: topic.parentName,
    state: deriveTopicState(topic.progress),
    recentlyPractised: topic.lastPracticedAt !== null,
  }));
}

export function sortTopicViews(
  topics: TopicProgressView[],
): TopicProgressView[] {
  return [...topics].sort(
    (a, b) =>
      statePriority(a.state.key) - statePriority(b.state.key) ||
      Number(b.recentlyPractised) - Number(a.recentlyPractised) ||
      a.name.localeCompare(b.name),
  );
}

export function filterToProgressedTopics(
  topics: TopicProgressView[],
): TopicProgressView[] {
  return topics.filter((topic) => topic.state.key !== "not-started");
}

export function countOverview(topics: TopicProgressView[]): ProgressOverview | null {
  let workingOn = 0;
  let strong = 0;
  let needsPractice = 0;

  for (const topic of topics) {
    if (topic.state.key === "in-progress") {
      workingOn += 1;
    } else if (topic.state.key === "strong") {
      strong += 1;
    } else if (topic.state.key === "needs-practice") {
      needsPractice += 1;
    }
  }

  if (workingOn + strong + needsPractice === 0) {
    return null;
  }

  return { workingOn, strong, needsPractice };
}

export function summarizeSubjectProgress(
  subject: SubjectMeta,
  topics: TopicProgressView[],
): SubjectProgressView {
  let started = 0;
  let strong = 0;
  let needsPractice = 0;

  for (const topic of topics) {
    if (topic.state.key === "not-started") {
      continue;
    }
    started += 1;
    if (topic.state.key === "strong") {
      strong += 1;
    } else if (topic.state.key === "needs-practice") {
      needsPractice += 1;
    }
  }

  return {
    slug: subject.slug,
    name: subject.name,
    iconKey: subject.iconKey,
    totalTopics: topics.length,
    started,
    notStarted: topics.length - started,
    strong,
    needsPractice,
  };
}

export function buildNextUp(
  topics: TopicProgressView[],
  interventionBySlug: Map<string, string | null>,
): NextUpView | null {
  const ranked = [...topics].sort(
    (a, b) => statePriority(a.state.key) - statePriority(b.state.key),
  );
  const target = ranked[0];

  if (!target || target.state.key === "not-started") {
    return null;
  }

  if (target.state.key === "needs-practice") {
    const mapped = insightMessageForIntervention(
      interventionBySlug.get(target.slug) ?? null,
      target.name,
    );
    return {
      topicName: target.name,
      message: mapped ?? `${target.name} needs a little more practice.`,
      mascotKey: "supportive",
    };
  }

  if (target.state.key === "in-progress") {
    return {
      topicName: target.name,
      message: `You're building confidence with ${target.name}. One more round could help it stick.`,
      mascotKey: "encouraging",
    };
  }

  return {
    topicName: target.name,
    message: `You're doing well with ${target.name}. Try another topic when you're ready.`,
    mascotKey: "celebrating",
  };
}

export function relativeWhenLabel(iso: string, now: Date): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / 86_400_000,
  );

  if (dayDiff <= 0) {
    return "Today";
  }
  if (dayDiff === 1) {
    return "Yesterday";
  }
  if (dayDiff < 7) {
    return `${dayDiff} days ago`;
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function mapRecentLearning(
  attempts: RecentAttemptEvidence[],
  now: Date,
  maxItems = 3,
): RecentLearningItem[] {
  const items: RecentLearningItem[] = [];

  attempts.forEach((attempt, index) => {
    if (attempt.isCorrect !== true && attempt.isCorrect !== false) {
      return;
    }
    if (!attempt.topicNameSnapshot && !attempt.conceptName) {
      return;
    }
    items.push({
      key: `${attempt.topicNameSnapshot ?? "topic"}-${attempt.conceptName ?? "question"}-${index}`,
      topicName: attempt.topicNameSnapshot ?? "Recent practice",
      conceptName: attempt.conceptName,
      kind: attempt.isCorrect ? "correct" : "incorrect",
      whenLabel: relativeWhenLabel(attempt.createdAt, now),
    });
  });

  return items.slice(0, maxItems);
}