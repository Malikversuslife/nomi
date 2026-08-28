export type ProfilePreferences = {
  displayName: string;
  gradeYear: string | null;
  dailyGoalMinutes: number;
  explanationStyle: string | null;
};

export type ProfileRecentTopic = {
  name: string;
  lastPracticedLabel: string;
};

export type ProfileLearningSummary = {
  activeSubjects: number;
  activeSubjectNames: string[];
  topicsTouched: number;
  questionsAnswered: number;
  lastPracticedLabel: string | null;
  recentTopics: ProfileRecentTopic[];
};

export type ProfileExperienceData = {
  displayName: string;
  email: string;
  memberSinceLabel: string | null;
  preferences: ProfilePreferences;
  summary: ProfileLearningSummary;
  hasPracticeEvidence: boolean;
};