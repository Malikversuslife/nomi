export type TutorSuggestedAction = "practice" | "review" | "example" | "none";

export type TutorResponse = {
  message: string;
  followUp?: string;
  suggestedAction: TutorSuggestedAction;
};

export type TutorMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedAction?: TutorSuggestedAction | null;
  followUp?: string | null;
};

export type TutorClientContext = {
  subjectName: string | null;
  topicName: string | null;
};

export type TutorContextInput = {
  subjectName?: string | null;
  topicName?: string | null;
  gradeYear?: string | null;
  explanationStyle?: string | null;
  intervention?: string | null;
  misconceptionCategory?: string | null;
  misconceptionStatus?: string | null;
  recentPracticeCorrect?: boolean | null;
};

export type TutorConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type TutorInitialData = {
  threadId: string | null;
  messages: TutorMessageView[];
  context: TutorClientContext;
};