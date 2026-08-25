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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type LearnerSubject = Database["public"]["Tables"]["learner_subjects"]["Row"];
export type TopicProgress = Database["public"]["Tables"]["topic_progress"]["Row"];
