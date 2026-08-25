import "server-only";
import { hasSupabaseConfig } from "@/server/env";
import { createServerSupabaseClient } from "@/server/supabase/server";
import type { Subject, Topic } from "@/server/supabase/types";
import { buildTopicTree, type TopicNode } from "@/domain/subjects/topic-tree";

export type SubjectWithTopics = Subject & {
  topics: TopicNode[];
};

export async function getSubjects() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("subjects").select("*").eq("active", true).order("sort_order");

  if (error) {
    throw new Error(`Unable to load subjects: ${error.message}`);
  }

  return data;
}

export async function getTopicHierarchy() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("topics").select("*").eq("active", true).order("sort_order");

  if (error) {
    throw new Error(`Unable to load topics: ${error.message}`);
  }

  return buildTopicTree(data as Topic[]);
}

export async function getSubjectsWithTopicHierarchy(): Promise<SubjectWithTopics[]> {
  const [subjects, topicTrees] = await Promise.all([getSubjects(), getTopicHierarchy()]);

  return subjects.map((subject) => ({
    ...subject,
    topics: topicTrees.filter((topic) => topic.subject_id === subject.id),
  }));
}
