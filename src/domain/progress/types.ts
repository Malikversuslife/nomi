import type { LearnTopicStatePresentation } from "@/domain/learn/topic-state";

export type ProgressOverview = {
  workingOn: number;
  strong: number;
  needsPractice: number;
};

export type SubjectProgressView = {
  slug: string;
  name: string;
  iconKey: string | null;
  totalTopics: number;
  started: number;
  notStarted: number;
  strong: number;
  needsPractice: number;
};

export type TopicProgressView = {
  slug: string;
  name: string;
  subjectName: string;
  parentName: string | null;
  state: LearnTopicStatePresentation;
  recentlyPractised: boolean;
};

export type NextUpView = {
  topicName: string;
  message: string;
  mascotKey: "supportive" | "encouraging" | "celebrating";
};

export type RecentLearningItem = {
  key: string;
  topicName: string;
  conceptName: string | null;
  kind: "correct" | "incorrect";
  whenLabel: string;
};

export type ProgressExperienceData = {
  hasCurriculum: boolean;
  hasEvidence: boolean;
  overview: ProgressOverview | null;
  subjects: SubjectProgressView[];
  topics: TopicProgressView[];
  nextUp: NextUpView | null;
  recentLearning: RecentLearningItem[];
};