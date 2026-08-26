import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { NomiGreeting } from "@/components/nomi/nomi-greeting";
import { ContinueLearningCard } from "@/components/learn/continue-learning-card";
import { NomiRecommendation } from "@/components/nomi/nomi-recommendation";
import { SubjectCard } from "@/components/curriculum/subject-card";
import { RecentLearning } from "@/components/learner/recent-learning";
import { hasSupabaseConfig } from "@/server/env";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { getLearnerSubjects, getProfile, getTopicProgress } from "@/server/data/learner";
import { requireUser } from "@/server/supabase/auth";

const DISPLAY_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology"];

export default async function HomeRoutePage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Home"><ConfigurationNotice /></FoundationShell>;
  }

  const user = await requireUser();
  const [profile, subjects, learnerSubjects, topicProgress] = await Promise.all([
    getProfile(user.id),
    getSubjectsWithTopicHierarchy(),
    getLearnerSubjects(user.id),
    getTopicProgress(user.id),
  ]);

  const displayName = profile?.display_name ?? undefined;

  // Resolve the learner's enrolled subject name (no UUIDs exposed)
  let enrolledSubject: string | undefined;
  if (learnerSubjects.length > 0) {
    const learnerSubjectId = learnerSubjects[0]?.subject_id;
    if (typeof learnerSubjectId === "string") {
      enrolledSubject = subjects.find((s) => (s.id as string) === learnerSubjectId)?.name;
    }
  }

  // Derive recent topic names from progress records
  // $ExpectedError: Supabase topicProgress type has SelectQueryError for 'topics',
  // so we cast to access the runtime shape where topics is an array of {topic_name}.
  const topicNames: string[] = [];
  if (Array.isArray(topicProgress)) {
    for (const record of topicProgress) {
      const topics = (record as Record<string, unknown>).topics;
      if (Array.isArray(topics)) {
        for (const t of topics) {
          const name = (t as { topic_name?: string }).topic_name;
          if (name && !topicNames.includes(name)) {
            topicNames.push(name);
          }
        }
      }
    }
  }

  // Adaptive recommendation from topic progress
  let intervention:
    | "continue"
    | "reinforce"
    | "simplify"
    | "worked_example"
    | "hint"
    | "retry"
    | "increase_challenge"
    | "review_prerequisite" | undefined;
  if (Array.isArray(topicProgress) && topicProgress.length > 0) {
    const recent = topicProgress[0];
    if (
      recent?.topics &&
      Array.isArray(recent.topics) &&
      recent.topics.length > 0
    ) {
      const statuses = recent.topics.map((t: { status: string }) => t.status);
      const hasRecurring = statuses.includes("recurring");
      const hasNeedsPractice = statuses.includes("needs practice");
      const strongCount = statuses.filter((s: string) => s === "strong").length;
      if (hasRecurring || hasNeedsPractice) {
        intervention = "review_prerequisite";
      } else if (strongCount > 0) {
        intervention = "continue";
      }
    }
  }

  // Build recent learning records (no UUIDs)
  const recentLearningRecords: Array<{ topic: string; lastPractised: string }> = [];
  if (Array.isArray(topicProgress)) {
    for (const record of topicProgress) {
      const topics = (record as Record<string, unknown>).topics;
      if (Array.isArray(topics) && topics.length > 0) {
        const first = topics[0] as { topic_name?: string };
        if (first.topic_name) {
          recentLearningRecords.push({
            topic: first.topic_name,
            lastPractised: new Date().toLocaleDateString(),
          });
        }
      }
    }
  }

  return (
    <FoundationShell active="Home">
      <NomiGreeting name={displayName} />

      <ContinueLearningCard
        subject={enrolledSubject}
        currentTopic={topicNames[0]}
        nextTopic={topicNames[1]}
      />

      <NomiRecommendation
        intervention={intervention}
        topicName={topicNames[0]}
      />

      <SubjectCard subjects={DISPLAY_SUBJECTS} activeSubject={enrolledSubject} />

      <RecentLearning records={recentLearningRecords} />
    </FoundationShell>
  );
}