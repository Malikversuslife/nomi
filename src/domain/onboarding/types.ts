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
  field?: string;
  searchTerms?: string[];
  availability?: "available" | "coming_soon";
  artworkKind?: "3d" | "icon";
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
