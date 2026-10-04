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

export async function buildTutorContext(userId: string, preferredTopicId?: string): Promise<TutorServerContext> {
  const supabase = await createServerSupabaseClient();
  const progressQuery = supabase.from("topic_progress").select("*").eq("user_id", userId);
  const { data: progress } = preferredTopicId
    ? await progressQuery.eq("topic_id", preferredTopicId).maybeSingle()
    : await progressQuery.order("updated_at", { ascending: false }).limit(1).maybeSingle();

  if (!progress) {
    const { data: selectedTopic } = preferredTopicId
      ? await supabase.from("topics").select("id,name,subject_id").eq("id", preferredTopicId).eq("active", true).maybeSingle()
      : { data: null };
    const { data: selectedSubject } = selectedTopic
      ? await supabase.from("subjects").select("name").eq("id", selectedTopic.subject_id).maybeSingle()
      : { data: null };
    return {
      client: { subjectName: selectedSubject?.name ?? null, topicName: selectedTopic?.name ?? null },
      input: { subjectName: selectedSubject?.name ?? null, topicName: selectedTopic?.name ?? null },
      topicProgressId: null,
      title: selectedTopic?.name ?? "General tutor",
    };
  }

  const [topicResult, attemptResult, misconceptionResult, profile] = await Promise.all([
    supabase.from("topics").select("*").eq("id", progress.topic_id).maybeSingle(),
    supabase
      .from("practice_attempts")
      .select("is_correct")
      .eq("topic_progress_id", progress.id)
      .order("created_at", { ascending: false })
      .limit(5),
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

  const recentAttempts = attemptResult.data ?? [];
  const recentCorrectCount = recentAttempts.filter((attempt) => attempt.is_correct === true).length;
  const input: TutorContextInput = {
    subjectName,
    topicName: topicResult.data?.name ?? null,
    gradeYear: profile?.grade_year ?? null,
    explanationStyle:
      progress.preferred_explanation_style ?? profile?.preferred_explanation_style ?? null,
    intervention: progress.recommended_intervention,
    misconceptionCategory: misconceptionResult.data?.category ?? null,
    misconceptionStatus: misconceptionResult.data?.status ?? null,
    recentPracticeCorrect: recentAttempts[0]?.is_correct ?? null,
    recentPracticeSummary: recentAttempts.length ? `${recentCorrectCount} of ${recentAttempts.length} latest ${topicResult.data?.name ?? "topic"} answers correct` : null,
  };

  const topicName = input.topicName;

  return {
    client: { subjectName, topicName: topicName ?? null, mastery: progress.mastery, difficulty: progress.difficulty, recentAccuracy: progress.recent_accuracy, recentAttemptCount: recentAttempts.length, recentCorrectCount },
    input,
    topicProgressId: progress.id,
    title: topicName ? `${topicName}` : "General tutor",
  };
}
