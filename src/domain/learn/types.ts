import type { LearnTopicStatePresentation } from "./topic-state";

export type LearnTopicRowView = {
  id?: string;
  slug: string;
  name: string;
  state: LearnTopicStatePresentation;
  recommended: boolean;
};

export type LearnUnitGroupView = {
  slug: string;
  name: string;
  rows: LearnTopicRowView[];
};

export type LearnUnitView = {
  slug: string;
  name: string;
  description: string | null;
  rows: LearnTopicRowView[];
  groups: LearnUnitGroupView[];
};

export type LearnSubjectView = {
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  field?: string;
  searchTerms?: string[];
  availability?: "available" | "coming_soon";
  artworkKind?: "3d" | "icon";
  enrolled?: boolean;
  units: LearnUnitView[];
};

export type LearnContinueView =
  | { kind: "start" }
  | {
      kind: "continue";
      subjectName: string;
      parentName: string | null;
      topicName: string;
      topicSlug?: string;
      topicId?: string;
      state: LearnTopicStatePresentation;
    };

export type LearnInsightView = {
  topicName: string;
  message: string;
};

export type LearnExperienceData = {
  subjects: LearnSubjectView[];
  defaultSubjectSlug: string | null;
  continueView: LearnContinueView;
  insightView: LearnInsightView | null;
};
