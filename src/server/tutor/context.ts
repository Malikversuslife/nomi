import "server-only";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import type { TutorClientContext, TutorContextInput } from "@/domain/tutor/types";

export type TutorServerContext = {
  client: TutorClientContext;
  input: TutorContextInput;
  topicProgressId: string | null;
  title: string;
};

export async function buildTutorContext(userId: string, topicId?: string | null): Promise<TutorServerContext> {
  // Mobile tutor requests authenticate with a Bearer token rather than the web
  // app's cookie session. Use the service-role client only after the route has
  // verified that token, then scope every learner query explicitly to userId.
  const supabase = createSupabaseAdminClient();

  let progressQuery = supabase.from("topic_progress").select("*").eq("user_id", userId);
  progressQuery = topicId ? progressQuery.eq("topic_id", topicId) : progressQuery.order("updated_at", { ascending: false });
  const { data: progress, error: progressError } = await progressQuery.limit(1).maybeSingle();

  if (progressError) {
    throw new Error(`Unable to load tutor progress: ${progressError.message}`);
  }

  if (!progress) {
    let selectedTopic: { id: string; name: string; subject_id: string } | null = null;
    let subjectName: string | null = null;

    if (topicId) {
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id,name,subject_id")
        .eq("id", topicId)
        .maybeSingle();
      if (topicError) throw new Error(`Unable to load tutor topic: ${topicError.message}`);
      selectedTopic = topic;

      if (selectedTopic) {
        const { data: subject, error: subjectError } = await supabase
          .from("subjects")
          .select("name")
          .eq("id", selectedTopic.subject_id)
          .maybeSingle();
        if (subjectError) throw new Error(`Unable to load tutor subject: ${subjectError.message}`);
        subjectName = subject?.name ?? null;
      }
    }

    return {
      client: { subjectName, topicName: selectedTopic?.name ?? null },
      input: { subjectName, topicName: selectedTopic?.name ?? null },
      topicProgressId: null,
      title: selectedTopic?.name ?? "General tutor",
    };
  }

  const [topicResult, attemptResult, misconceptionResult, profileResult] = await Promise.all([
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
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
  ]);

  if (topicResult.error) throw new Error(`Unable to load tutor topic: ${topicResult.error.message}`);
  if (attemptResult.error) throw new Error(`Unable to load tutor attempt: ${attemptResult.error.message}`);
  if (misconceptionResult.error) throw new Error(`Unable to load tutor misconception: ${misconceptionResult.error.message}`);
  if (profileResult.error) throw new Error(`Unable to load tutor profile: ${profileResult.error.message}`);

  const profile = profileResult.data;
  let subjectName: string | null = null;

  if (topicResult.data) {
    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", topicResult.data.subject_id)
      .maybeSingle();
    if (subjectError) throw new Error(`Unable to load tutor subject: ${subjectError.message}`);
    subjectName = subject?.name ?? null;
  }

  const input: TutorContextInput = {
    subjectName,
    topicName: topicResult.data?.name ?? null,
    gradeYear: profile?.grade_year ?? null,
    explanationStyle: progress.preferred_explanation_style ?? profile?.preferred_explanation_style ?? null,
    intervention: progress.recommended_intervention,
    misconceptionCategory: misconceptionResult.data?.category ?? null,
    misconceptionStatus: misconceptionResult.data?.status ?? null,
    recentPracticeCorrect:
      attemptResult.data && typeof attemptResult.data.is_correct === "boolean"
        ? attemptResult.data.is_correct
        : null,
    mastery: typeof progress.mastery === "number" ? progress.mastery : Number(progress.mastery),
    difficulty: typeof progress.difficulty === "number" ? progress.difficulty : Number(progress.difficulty),
  };

  const topicName = input.topicName;

  return {
    client: { subjectName, topicName: topicName ?? null },
    input,
    topicProgressId: progress.id,
    title: topicName ? `${topicName}` : "General tutor",
  };
}