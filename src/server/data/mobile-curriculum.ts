import "server-only";

import { createServerSupabaseClient } from "@/server/supabase/server";

export type CurrentTopic = {
  id: string;
  slug: string;
  name: string;
  parentName: string | null;
  mastery: number;
  difficulty: number;
  state: "completed" | "current" | "next" | "locked";
};

/** The same leaf ordering and 80% progression rule used by the mobile app. */
export async function getMobileCurriculum(userId: string, subjectSlug = "mathematics") {
  const supabase = await createServerSupabaseClient();
  const { data: subject, error: subjectError } = await supabase
    .from("subjects").select("id,slug,name").eq("slug", subjectSlug).eq("active", true).maybeSingle();
  if (subjectError) throw new Error(subjectError.message);
  if (!subject) return { subject: null, topics: [] as CurrentTopic[], currentTopic: null, isPathComplete: false };

  const [{ data: rows, error: topicError }, { data: progress, error: progressError }] = await Promise.all([
    supabase.from("topics").select("id,slug,name,parent_topic_id,sort_order").eq("subject_id", subject.id).eq("active", true).order("sort_order"),
    supabase.from("topic_progress").select("topic_id,mastery,difficulty").eq("user_id", userId),
  ]);
  if (topicError || progressError) throw new Error(topicError?.message ?? progressError?.message);

  const all = rows ?? [];
  const progressByTopic = new Map((progress ?? []).map((row) => [row.topic_id, row]));
  const leaves = all.filter((row) => !all.some((candidate) => candidate.parent_topic_id === row.id))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const firstIncomplete = leaves.findIndex((row) => (progressByTopic.get(row.id)?.mastery ?? 0) < 80);
  const topics: CurrentTopic[] = leaves.map((row, index) => {
    const learner = progressByTopic.get(row.id);
    const mastery = Math.round(learner?.mastery ?? 0);
    const state = mastery >= 80 ? "completed" : index === firstIncomplete ? "current" : index === firstIncomplete + 1 ? "next" : "locked";
    return {
      id: row.id, slug: row.slug, name: row.name,
      parentName: all.find((parent) => parent.id === row.parent_topic_id)?.name ?? null,
      mastery, difficulty: learner?.difficulty ?? 1, state,
    };
  });
  const isPathComplete = topics.length > 0 && topics.every((topic) => topic.state === "completed");
  return { subject, topics, currentTopic: topics.find((topic) => topic.state === "current") ?? null, isPathComplete };
}

export async function resolveMobileCurriculum(userId: string, requestedTopic?: string) {
  if (!requestedTopic) {
    const curriculum = await getMobileCurriculum(userId);
    return { curriculum, topic: curriculum.currentTopic ?? curriculum.topics[0] ?? null };
  }
  const supabase = await createServerSupabaseClient();
  const topicQuery = supabase.from("topics").select("id,subject_id").eq("active", true);
  const { data: requested } = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(requestedTopic)
    ? await topicQuery.eq("id", requestedTopic).maybeSingle()
    : await topicQuery.eq("slug", requestedTopic).maybeSingle();
  if (!requested) {
    const curriculum = await getMobileCurriculum(userId);
    return { curriculum, topic: curriculum.currentTopic ?? curriculum.topics[0] ?? null };
  }
  const { data: subject } = await supabase.from("subjects").select("slug").eq("id", requested.subject_id).eq("active", true).maybeSingle();
  const curriculum = await getMobileCurriculum(userId, subject?.slug ?? "mathematics");
  return { curriculum, topic: curriculum.topics.find((topic) => topic.id === requested.id) ?? null };
}
