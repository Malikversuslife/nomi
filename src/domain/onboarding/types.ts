export type OnboardingStatus = "needs-onboarding" | "complete";

export type PostAuthRoute = "/onboarding" | "/home";

export type OnboardingStartingTopic = {
  subjectName: string;
  unitName: string;
  groupName: string | null;
  topicName: string;
};

export type OnboardingSubjectView = {
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  startingTopic: OnboardingStartingTopic | null;
};

export type OnboardingExperienceData = {
  displayName: string | null;
  subjects: OnboardingSubjectView[];
};

export type OnboardingCompleteActionState = {
  error?: string;
  success?: boolean;
};