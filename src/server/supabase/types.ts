export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          grade_year: string | null;
          daily_goal_minutes: number;
          preferred_explanation_style: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          grade_year?: string | null;
          daily_goal_minutes?: number;
          preferred_explanation_style?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Insert"], "id">>;
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon_key: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          parent_topic_id: string | null;
          slug: string;
          name: string;
          description: string | null;
          depth: number;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      learner_subjects: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          status: "active" | "paused" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          subject_id: string;
          status?: "active" | "paused" | "archived";
        };
        Update: {
          status?: "active" | "paused" | "archived";
        };
        Relationships: [];
      };
      topic_progress: {
        Row: {
          id: string;
          user_id: string;
          learner_subject_id: string;
          topic_id: string;
          mastery: number;
          recent_accuracy: number;
          difficulty: number;
          attempted_count: number;
          correct_count: number;
          consecutive_correct: number;
          consecutive_incorrect: number;
          confidence: number | null;
          preferred_explanation_style: string | null;
          recommended_intervention: string | null;
          last_practiced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          learner_subject_id: string;
          topic_id: string;
        };
        Update: Partial<Pick<Database["public"]["Tables"]["topic_progress"]["Row"], "mastery" | "recent_accuracy" | "difficulty" | "attempted_count" | "correct_count" | "consecutive_correct" | "consecutive_incorrect" | "confidence" | "preferred_explanation_style" | "recommended_intervention" | "last_practiced_at">>;
        Relationships: [];
      };
      practice_questions: {
        Row: {
          id: string;
          topic_id: string;
          slug: string;
          concept_name: string;
          difficulty: number;
          question_type: "multiple_choice" | "short_answer";
          prompt: string;
          options: Json | null;
          expected_answer: Json;
          explanation: string;
          misconception_key: string | null;
          misconception_category: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      practice_attempts: {
        Row: {
          id: string;
          user_id: string;
          topic_progress_id: string;
          topic_id: string;
          concept_name: string | null;
          difficulty: number;
          question_snapshot: Json;
          expected_answer: Json | null;
          learner_answer: Json | null;
          is_correct: boolean | null;
          response_time_ms: number | null;
          misconception_category: string | null;
          subject_name_snapshot: string | null;
          topic_name_snapshot: string | null;
          learning_session_id: string | null;
          submission_key: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      misconception_state: {
        Row: {
          id: string;
          user_id: string;
          topic_progress_id: string;
          topic_id: string;
          concept_name: string;
          category: string;
          status: "active" | "recurring" | "improving" | "resolved";
          occurrence_count: number;
          first_seen_at: string;
          last_seen_at: string;
          resolved_at: string | null;
          evidence_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: "study" | "practice" | "tutor" | "review";
          subject_id: string | null;
          topic_id: string | null;
          started_at: string;
          ended_at: string | null;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          mode?: "study" | "practice" | "tutor" | "review";
          subject_id?: string | null;
          topic_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          summary?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      tutor_threads: {
        Row: {
          id: string;
          user_id: string;
          topic_progress_id: string | null;
          learning_session_id: string | null;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          topic_progress_id?: string | null;
          learning_session_id?: string | null;
          title?: string;
        };
        Update: {
          title?: string;
          learning_session_id?: string | null;
        };
        Relationships: [];
      };
      tutor_messages: {
        Row: {
          id: string;
          user_id: string;
          thread_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          thread_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata?: Json;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      persist_practice_result: {
        Args: {
          p_submission_key: string;
          p_learner_subject_id: string;
          p_topic_progress_id: string;
          p_topic_id: string;
          p_concept_name: string;
          p_difficulty: number;
          p_question_snapshot: Json;
          p_expected_answer: Json;
          p_learner_answer: Json;
          p_is_correct: boolean;
          p_response_time_ms: number | null;
          p_misconception_key: string | null;
          p_misconception_category: string | null;
          p_misconception_status: string | null;
          p_misconception_occurrence_count: number | null;
          p_misconception_evidence_summary: string | null;
          p_subject_name_snapshot: string;
          p_topic_name_snapshot: string;
          p_learning_session_id: string | null;
          p_mastery: number;
          p_recent_accuracy: number;
          p_next_difficulty: number;
          p_attempted_count: number;
          p_correct_count: number;
          p_consecutive_correct: number;
          p_consecutive_incorrect: number;
          p_recommended_intervention: string;
        };
        Returns: { attempt_id: string; inserted: boolean }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type LearnerSubject = Database["public"]["Tables"]["learner_subjects"]["Row"];
export type TopicProgress = Database["public"]["Tables"]["topic_progress"]["Row"];
export type PracticeQuestion = Database["public"]["Tables"]["practice_questions"]["Row"];
export type PracticeAttempt = Database["public"]["Tables"]["practice_attempts"]["Row"];
export type PersistedMisconceptionState = Database["public"]["Tables"]["misconception_state"]["Row"];
export type TutorThread = Database["public"]["Tables"]["tutor_threads"]["Row"];
export type TutorMessage = Database["public"]["Tables"]["tutor_messages"]["Row"];
