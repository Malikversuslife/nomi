import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";

export type CurriculumTopicState = "completed" | "current" | "next" | "locked";
export type CurriculumTopic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentTopicId: string | null;
  depth: number;
  sortOrder: number;
  mastery: number;
  difficulty: number;
  state: CurriculumTopicState;
};
export type CurriculumSubject = { id: string; slug: string; name: string; description: string | null };

type TopicRow = { id:string; slug:string; name:string; description:string|null; parent_topic_id:string|null; depth:number; sort_order:number };
type ProgressRow = { topic_id:string; mastery:number; difficulty:number };

export function useCurriculum(subjectSlug = "mathematics") {
  const { user } = useLearnerSession();
  const [subject, setSubject] = useState<CurriculumSubject | null>(null);
  const [rows, setRows] = useState<TopicRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !user) { setLoading(false); return; }
    setLoading(true); setError(null);
    const { data: subjectData, error: subjectError } = await supabase.from("subjects").select("id,slug,name,description").eq("slug", subjectSlug).eq("active", true).maybeSingle();
    if (subjectError || !subjectData) { setError(subjectError?.message ?? "Curriculum subject is unavailable."); setLoading(false); return; }
    const [{ data: topicData, error: topicError }, { data: learnerProgress, error: progressError }] = await Promise.all([
      supabase.from("topics").select("id,slug,name,description,parent_topic_id,depth,sort_order").eq("subject_id", subjectData.id).eq("active", true).order("depth").order("sort_order"),
      supabase.from("topic_progress").select("topic_id,mastery,difficulty").eq("user_id", user.id),
    ]);
    if (topicError || progressError) { setError(topicError?.message ?? progressError?.message ?? "Curriculum could not be loaded."); setLoading(false); return; }
    setSubject(subjectData as CurriculumSubject); setRows((topicData ?? []) as TopicRow[]); setProgressRows((learnerProgress ?? []) as ProgressRow[]); setLoading(false);
  }, [subjectSlug, user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const topics = useMemo<CurriculumTopic[]>(() => {
    const progress = new Map(progressRows.map((item) => [item.topic_id, item]));
    const leaves = rows.filter((row) => !rows.some((candidate) => candidate.parent_topic_id === row.id));
    const ordered = [...leaves].sort((a,b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const firstIncomplete = ordered.findIndex((row) => (progress.get(row.id)?.mastery ?? 0) < 80);
    return ordered.map((row,index) => {
      const learner = progress.get(row.id); const mastery = Math.round(learner?.mastery ?? 0); const difficulty = learner?.difficulty ?? 1;
      let state:CurriculumTopicState = "locked";
      if (mastery >= 80) state = "completed";
      else if (index === firstIncomplete) state = mastery > 0 ? "current" : index === 0 ? "current" : "next";
      else if (firstIncomplete >= 0 && index === firstIncomplete + 1) state = "next";
      return { id:row.id, slug:row.slug, name:row.name, description:row.description, parentTopicId:row.parent_topic_id, depth:row.depth, sortOrder:row.sort_order, mastery, difficulty, state };
    });
  }, [progressRows, rows]);

  const currentTopic = topics.find((topic) => topic.state === "current") ?? topics.find((topic) => topic.state === "next") ?? topics[0] ?? null;
  const parentName = currentTopic ? rows.find((row) => row.id === currentTopic.parentTopicId)?.name ?? null : null;

  return { subject, topics, currentTopic, parentName, loading, error, refresh: load };
}
