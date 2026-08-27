import "server-only";
import { getSubjectsWithTopicHierarchy, type SubjectWithTopics } from "@/server/data/curriculum";
import { getLearnerSubjects } from "@/server/data/learner";
import { createServerSupabaseClient } from "@/server/supabase/server";
import type { Topic } from "@/server/supabase/types";
import type { TopicNode } from "@/domain/subjects/topic-tree";
import {
  deriveTopicState,
  insightMessageForIntervention,
  type LearnTopicProgress,
} from "@/domain/learn/topic-state";
import type {
  LearnContinueView,
  LearnExperienceData,
  LearnInsightView,
  LearnSubjectView,
  LearnTopicRowView,
  LearnUnitGroupView,
  LearnUnitView,
} from "@/domain/learn/types";

function flattenTopicNodes(nodes: SubjectWithTopics["topics"]): Topic[] {
  const result: Topic[] = [];
  const visit = (items: SubjectWithTopics["topics"]) => {
    for (const node of items) {
      result.push(node);
      visit(node.children);
    }
  };
  visit(nodes);
  return result;
}

function buildRowView(
  topic: Topic,
  progressMap: Map<string, LearnTopicProgress>,
  mostRecentTopicId: string | null,
): LearnTopicRowView {
  return {
    slug: topic.slug,
    name: topic.name,
    state: deriveTopicState(progressMap.get(topic.id) ?? null),
    recommended: topic.id === mostRecentTopicId,
  };
}

function buildUnitView(
  root: TopicNode,
  progressMap: Map<string, LearnTopicProgress>,
  mostRecentTopicId: string | null,
): LearnUnitView {
  const rows: LearnTopicRowView[] = [];
  const groups: LearnUnitGroupView[] = [];

  for (const child of root.children) {
    if (child.children.length === 0) {
      rows.push(buildRowView(child, progressMap, mostRecentTopicId));
    } else {
      groups.push({
        slug: child.slug,
        name: child.name,
        rows: child.children.map((leaf) => buildRowView(leaf, progressMap, mostRecentTopicId)),
      });
    }
  }

  return {
    slug: root.slug,
    name: root.name,
    description: root.description,
    rows,
    groups,
  };
}

function buildContinueView(
  mostRecentTopicId: string | null,
  topicById: Map<string, Topic>,
  subjectsWithTopics: SubjectWithTopics[],
  progressMap: Map<string, LearnTopicProgress>,
): LearnContinueView {
  if (!mostRecentTopicId) {
    return { kind: "start" };
  }

  const topic = topicById.get(mostRecentTopicId);
  if (!topic) {
    return { kind: "start" };
  }

  const subject = subjectsWithTopics.find((s) => s.id === topic.subject_id);

  return {
    kind: "continue",
    subjectName: subject?.name ?? "",
    topicName: topic.name,
    parentName: topic.parent_topic_id
      ? topicById.get(topic.parent_topic_id)?.name ?? null
      : null,
    state: deriveTopicState(progressMap.get(mostRecentTopicId) ?? null),
  };
}

function buildInsightView(
  mostRecentTopicId: string | null,
  topicById: Map<string, Topic>,
  interventionMap: Map<string, string | null>,
): LearnInsightView | null {
  if (!mostRecentTopicId) {
    return null;
  }

  const topic = topicById.get(mostRecentTopicId);
  if (!topic) {
    return null;
  }

  const message = insightMessageForIntervention(
    interventionMap.get(mostRecentTopicId) ?? null,
    topic.name,
  );

  return message ? { topicName: topic.name, message } : null;
}

function resolveDefaultSubjectSlug(
  subjectsWithTopics: SubjectWithTopics[],
  mostRecentTopicId: string | null,
  topicById: Map<string, Topic>,
  learnerSubjectSlug: string | null,
): string | null {
  let slug: string | null = null;

  if (mostRecentTopicId) {
    const topic = topicById.get(mostRecentTopicId);
    if (topic) {
      slug = subjectsWithTopics.find((s) => s.id === topic.subject_id)?.slug ?? null;
    }
  }

  if (!slug && learnerSubjectSlug) {
    slug = subjectsWithTopics.some((s) => s.slug === learnerSubjectSlug)
      ? learnerSubjectSlug
      : null;
  }

  return slug ?? subjectsWithTopics[0]?.slug ?? null;
}

export async function buildLearnExperience(userId: string): Promise<LearnExperienceData> {
  const supabase = await createServerSupabaseClient();

  const [subjectsWithTopics, progressResult, learnerSubjects] = await Promise.all([
    getSubjectsWithTopicHierarchy(),
    supabase
      .from("topic_progress")
      .select(
        "topic_id,mastery,recent_accuracy,attempted_count,consecutive_incorrect,recommended_intervention,updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    getLearnerSubjects(userId),
  ]);

  if (progressResult.error) {
    throw new Error(`Unable to load topic progress: ${progressResult.error.message}`);
  }

  const progressRows = progressResult.data ?? [];

  const progressMap = new Map<string, LearnTopicProgress>();
  const interventionMap = new Map<string, string | null>();
  for (const row of progressRows) {
    progressMap.set(row.topic_id, {
      mastery: row.mastery,
      recentAccuracy: row.recent_accuracy,
      attemptedCount: row.attempted_count,
      consecutiveIncorrect: row.consecutive_incorrect,
    });
    interventionMap.set(row.topic_id, row.recommended_intervention);
  }

  const topicById = new Map<string, Topic>();
  for (const subject of subjectsWithTopics) {
    for (const topic of flattenTopicNodes(subject.topics)) {
      topicById.set(topic.id, topic);
    }
  }

  const mostRecentTopicId = progressRows[0]?.topic_id ?? null;

  // Fall back to the learner's enrolled subject (set by onboarding) when there
  // is no practice history yet, before defaulting to the first curriculum subject.
  const learnerSubjectSlug =
    (learnerSubjects[0] as { subjects?: { slug?: string } | null } | null | undefined)
      ?.subjects?.slug ?? null;

  const subjects: LearnSubjectView[] = subjectsWithTopics.map((subject) => ({
    slug: subject.slug,
    name: subject.name,
    description: subject.description,
    iconKey: subject.icon_key,
    units: subject.topics.map((root) => buildUnitView(root, progressMap, mostRecentTopicId)),
  }));

  return {
    subjects,
    defaultSubjectSlug: resolveDefaultSubjectSlug(
      subjectsWithTopics,
      mostRecentTopicId,
      topicById,
      learnerSubjectSlug,
    ),
    continueView: buildContinueView(mostRecentTopicId, topicById, subjectsWithTopics, progressMap),
    insightView: buildInsightView(mostRecentTopicId, topicById, interventionMap),
  };
}