import "server-only";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { getProfile } from "@/server/data/learner";
import type { TutorClientContext, TutorContextInput } from "@/domain/tutor/types";

export type TutorServerContext = {
  client: TutorClientContext;
  input: TutorContextInput;
  topicProgressId: string | null;
  title: string;
};

export async function buildTutorContext(userId: string): Promise<TutorServerContext> {
  const supabase = await createServerSupabaseClient();

  const { data: progress } = await supabase
    .from("topic_progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!progress) {
    return {
      client: { subjectName: null, topicName: null },
      input: {},
      topicProgressId: null,
      title: "General tutor",
    };
  }

  const [topicResult, attemptResult, misconceptionResult, profile] = await Promise.all([
    supabase.from("topics").select("*").eq("id", progress.topic_id).maybeSingle(),
    supabase
      .from("practice_attempts")
      .select("is_correct")
      .eq("topic_progress_id", progress.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("misconception_state")
      .select("category,status")
      .eq("user_id", userId)
      .eq("topic_progress_id", progress.id)
      .in("status", ["active", "recurring"])
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getProfile(userId),
  ]);

  let subjectName: string | null = null;

  if (topicResult.data) {
    const { data: subject } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", topicResult.data.subject_id)
      .maybeSingle();
    subjectName = subject?.name ?? null;
  }

  const input: TutorContextInput = {
    subjectName,
    topicName: topicResult.data?.name ?? null,
    gradeYear: profile?.grade_year ?? null,
    explanationStyle:
      progress.preferred_explanation_style ?? profile?.preferred_explanation_style ?? null,
    intervention: progress.recommended_intervention,
    misconceptionCategory: misconceptionResult.data?.category ?? null,
    misconceptionStatus: misconceptionResult.data?.status ?? null,
    recentPracticeCorrect:
      attemptResult.data && typeof attemptResult.data.is_correct === "boolean"
        ? attemptResult.data.is_correct
        : null,
  };

  const topicName = input.topicName;

  return {
    client: { subjectName, topicName: topicName ?? null },
    input,
    topicProgressId: progress.id,
    title: topicName ? `${topicName}` : "General tutor",
  };
}