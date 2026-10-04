import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";

export type CurriculumTopicState = "completed" | "current" | "next" | "locked";
export type CurriculumTopic = {
  id: string; slug: string; name: string; description: string | null; parentTopicId: string | null;
  depth: number; sortOrder: number; mastery: number; difficulty: number; state: CurriculumTopicState;
};
export type CurriculumSubject = { id: string; slug: string; name: string; description: string | null };
type TopicRow = { id:string; slug:string; name:string; description:string|null; parent_topic_id:string|null; depth:number; sort_order:number };
type ProgressRow = { topic_id:string; mastery:number; difficulty:number };
type CurriculumData = { subject: CurriculumSubject | null; rows: TopicRow[]; progressRows: ProgressRow[] };
type CacheEntry = { data?: CurriculumData; promise?: Promise<CurriculumData>; updatedAt?: number };

const curriculumCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15_000;

async function fetchCurriculum(userId: string, subjectSlug: string): Promise<CurriculumData> {
  if (!supabase) return { subject: null, rows: [], progressRows: [] };
  const { data: subjectData, error: subjectError } = await supabase.from("subjects").select("id,slug,name,description").eq("slug", subjectSlug).eq("active", true).maybeSingle();
  if (subjectError || !subjectData) throw new Error(subjectError?.message ?? "Curriculum subject is unavailable.");
  const [{ data: topicData, error: topicError }, { data: learnerProgress, error: progressError }] = await Promise.all([
    supabase.from("topics").select("id,slug,name,description,parent_topic_id,depth,sort_order").eq("subject_id", subjectData.id).eq("active", true).order("depth").order("sort_order"),
    supabase.from("topic_progress").select("topic_id,mastery,difficulty").eq("user_id", userId),
  ]);
  if (topicError || progressError) throw new Error(topicError?.message ?? progressError?.message ?? "Curriculum could not be loaded.");
  return { subject: subjectData as CurriculumSubject, rows: (topicData ?? []) as TopicRow[], progressRows: (learnerProgress ?? []) as ProgressRow[] };
}

function getCurriculum(userId: string, subjectSlug: string, refresh = false) {
  const key = `${userId}:${subjectSlug}`;
  const entry = curriculumCache.get(key) ?? {};
  const fresh = entry.data && Date.now() - (entry.updatedAt ?? 0) < CACHE_TTL_MS;
  if (!refresh && fresh) return Promise.resolve(entry.data!);
  if (entry.promise) return entry.promise;
  const promise = fetchCurriculum(userId, subjectSlug).then((data) => {
    curriculumCache.set(key, { data, updatedAt: Date.now() });
    return data;
  }).catch((error) => {
    curriculumCache.set(key, { data: entry.data, updatedAt: entry.updatedAt });
    throw error;
  });
  curriculumCache.set(key, { ...entry, promise });
  return promise;
}

export function useCurriculum(subjectSlug = "mathematics") {
  const { user } = useLearnerSession();
  const key = user ? `${user.id}:${subjectSlug}` : "";
  const cached = key ? curriculumCache.get(key)?.data : undefined;
  const [subject, setSubject] = useState<CurriculumSubject | null>(cached?.subject ?? null);
  const [rows, setRows] = useState<TopicRow[]>(cached?.rows ?? []);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>(cached?.progressRows ?? []);
  const [loading, setLoading] = useState(Boolean(user && !cached));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user) { setSubject(null); setRows([]); setProgressRows([]); setError(null); setLoading(false); return; }
    const existing = curriculumCache.get(`${user.id}:${subjectSlug}`)?.data;
    if (!existing) setLoading(true);
    setError(null);
    try {
      const data = await getCurriculum(user.id, subjectSlug, refresh);
      setSubject(data.subject); setRows(data.rows); setProgressRows(data.progressRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Curriculum could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [subjectSlug, user]);

  useFocusEffect(useCallback(() => {
    const entry = user ? curriculumCache.get(`${user.id}:${subjectSlug}`) : undefined;
    const stale = !entry?.updatedAt || Date.now() - entry.updatedAt >= CACHE_TTL_MS;
    void load(stale);
  }, [load, subjectSlug, user]));

  const topics = useMemo<CurriculumTopic[]>(() => {
    const progress = new Map(progressRows.map((item) => [item.topic_id, item]));
    const leaves = rows.filter((row) => !rows.some((candidate) => candidate.parent_topic_id === row.id));
    const ordered = [...leaves].sort((a,b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const firstIncomplete = ordered.findIndex((row) => (progress.get(row.id)?.mastery ?? 0) < 80);
    return ordered.map((row,index) => {
      const learner = progress.get(row.id);
      const mastery = Math.round(learner?.mastery ?? 0);
      const difficulty = learner?.difficulty ?? 1;
      let state:CurriculumTopicState = "locked";
      if (mastery >= 80) state = "completed";
      else if (index === firstIncomplete) state = "current";
      else if (firstIncomplete >= 0 && index === firstIncomplete + 1) state = "next";
      return { id:row.id, slug:row.slug, name:row.name, description:row.description, parentTopicId:row.parent_topic_id, depth:row.depth, sortOrder:row.sort_order, mastery, difficulty, state };
    });
  }, [progressRows, rows]);

  const isPathComplete = topics.length > 0 && topics.every((topic) => topic.state === "completed");
  const currentTopic = isPathComplete ? null : topics.find((topic) => topic.state === "current") ?? topics.find((topic) => topic.state === "next") ?? null;
  const referenceTopic = currentTopic ?? topics.at(-1) ?? null;
  const parentName = referenceTopic ? rows.find((row) => row.id === referenceTopic.parentTopicId)?.name ?? null : null;
  return { subject, topics, currentTopic, parentName, isPathComplete, loading, error, refresh: () => load(true) };
}
