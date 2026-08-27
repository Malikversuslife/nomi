import "server-only";
import {
  getSubjectsWithTopicHierarchy,
  type SubjectWithTopics,
} from "@/server/data/curriculum";
import { createServerSupabaseClient } from "@/server/supabase/server";
import type { Topic } from "@/server/supabase/types";
import type { LearnTopicProgress } from "@/domain/learn/topic-state";
import {
  buildNextUp,
  countOverview,
  deriveTopicViews,
  mapRecentLearning,
  sortTopicViews,
  summarizeSubjectProgress,
  type ProgressTopicEvidence,
  type RecentAttemptEvidence,
} from "@/domain/progress/presentation";
import type {
  ProgressExperienceData,
  SubjectProgressView,
  TopicProgressView,
} from "@/domain/progress/types";

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

export async function buildProgressExperience(
  userId: string,
): Promise<ProgressExperienceData> {
  const supabase = await createServerSupabaseClient();

  const [subjectsWithTopics, progressResult, attemptsResult] = await Promise.all([
    getSubjectsWithTopicHierarchy(),
    supabase
      .from("topic_progress")
      .select(
        "topic_id,mastery,recent_accuracy,attempted_count,consecutive_incorrect,recommended_intervention,last_practiced_at,updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("practice_attempts")
      .select("topic_id,topic_name_snapshot,concept_name,is_correct,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (progressResult.error) {
    throw new Error(`Unable to load topic progress: ${progressResult.error.message}`);
  }

  if (attemptsResult.error) {
    throw new Error(`Unable to load recent practice: ${attemptsResult.error.message}`);
  }

  const progressRows = progressResult.data ?? [];
  const attempts = attemptsResult.data ?? [];

  const hasCurriculum = subjectsWithTopics.length > 0;
  const hasEvidence = progressRows.length > 0 || attempts.length > 0;
  const now = new Date();

  const recentLearning = mapRecentLearning(
    attempts.map<RecentAttemptEvidence>((attempt) => ({
      topicNameSnapshot: attempt.topic_name_snapshot,
      conceptName: attempt.concept_name,
      isCorrect: attempt.is_correct,
      createdAt: attempt.created_at,
    })),
    now,
  );

  if (!hasCurriculum) {
    return {
      hasCurriculum,
      hasEvidence,
      overview: null,
      subjects: [],
      topics: [],
      nextUp: null,
      recentLearning,
    };
  }

  const topicById = new Map<string, Topic>();
  const subjectById = new Map<
    string,
    { slug: string; name: string; iconKey: string | null }
  >();

  for (const subject of subjectsWithTopics) {
    subjectById.set(subject.id, {
      slug: subject.slug,
      name: subject.name,
      iconKey: subject.icon_key,
    });
    for (const topic of flattenTopicNodes(subject.topics)) {
      topicById.set(topic.id, topic);
    }
  }

  const progressMap = new Map<string, LearnTopicProgress>();
  const interventionById = new Map<string, string | null>();
  const lastPracticedById = new Map<string, string | null>();

  for (const row of progressRows) {
    progressMap.set(row.topic_id, {
      mastery: row.mastery,
      recentAccuracy: row.recent_accuracy,
      attemptedCount: row.attempted_count,
      consecutiveIncorrect: row.consecutive_incorrect,
    });
    interventionById.set(row.topic_id, row.recommended_intervention);
    if (row.last_practiced_at) {
      lastPracticedById.set(row.topic_id, row.last_practiced_at);
    }
  }

  const evidence: ProgressTopicEvidence[] = [];

  for (const subject of subjectsWithTopics) {
    for (const topic of flattenTopicNodes(subject.topics)) {
      const parent = topic.parent_topic_id
        ? topicById.get(topic.parent_topic_id)
        : null;
      evidence.push({
        topicId: topic.id,
        subjectId: subject.id,
        slug: topic.slug,
        name: topic.name,
        parentName: parent?.name ?? null,
        subjectName: subject.name,
        progress: progressMap.get(topic.id) ?? null,
        lastPracticedAt: lastPracticedById.get(topic.id) ?? null,
      });
    }
  }

  const topicViews = sortTopicViews(deriveTopicViews(evidence));

  const interventionBySlug = new Map<string, string | null>();
  for (const subject of subjectsWithTopics) {
    for (const topic of flattenTopicNodes(subject.topics)) {
      interventionBySlug.set(topic.slug, interventionById.get(topic.id) ?? null);
    }
  }

  const subjects: SubjectProgressView[] = subjectsWithTopics.map((subject) => {
    const subjectEvidence = evidence.filter((item) => item.subjectId === subject.id);
    return summarizeSubjectProgress(
      {
        slug: subject.slug,
        name: subject.name,
        iconKey: subject.icon_key,
      },
      sortTopicViews(deriveTopicViews(subjectEvidence)),
    );
  });

  const topics: TopicProgressView[] = topicViews;
  const overview = countOverview(topics);
  const nextUp = buildNextUp(topics, interventionBySlug);

  return {
    hasCurriculum,
    hasEvidence,
    overview,
    subjects,
    topics,
    nextUp,
    recentLearning,
  };
}