import { redirect } from "next/navigation";
import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { NomiGreeting } from "@/components/nomi/nomi-greeting";
import { ContinueLearningCard } from "@/components/learn/continue-learning-card";
import { NomiRecommendation } from "@/components/nomi/nomi-recommendation";
import { SubjectCard } from "@/components/curriculum/subject-card";
import { RecentLearning } from "@/components/learner/recent-learning";
import { deriveHomeViews } from "@/domain/home/presentation";
import { hasSupabaseConfig } from "@/server/env";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { getLearnerSubjects, getProfile, getTopicProgress } from "@/server/data/learner";
import { getOnboardingStatus } from "@/server/onboarding/status";
import { requireUser } from "@/server/supabase/auth";

const DISPLAY_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology"];

export default async function HomeRoutePage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Home"><ConfigurationNotice /></FoundationShell>;
  }

  const user = await requireUser();
  const status = await getOnboardingStatus(user.id);
  const [profile, subjects, learnerSubjects, topicProgress] = await Promise.all([
    getProfile(user.id),
    getSubjectsWithTopicHierarchy(),
    getLearnerSubjects(user.id),
    getTopicProgress(user.id),
  ]);

  // A genuinely new learner lands in onboarding rather than a blank Home.
  // Skipped when there is no curriculum, so onboarding cannot trap them.
  if (status === "needs-onboarding" && subjects.length > 0) {
    redirect("/onboarding");
  }

  const displayName = profile?.display_name ?? undefined;

  // Resolve the learner's enrolled subject name (no UUIDs exposed)
  let enrolledSubject: string | undefined;
  if (learnerSubjects.length > 0) {
    const learnerSubjectId = learnerSubjects[0]?.subject_id;
    if (typeof learnerSubjectId === "string") {
      enrolledSubject = subjects.find((s) => (s.id as string) === learnerSubjectId)?.name;
    }
  }

  // Truthful home views: real topic names and persisted practice timestamps.
  const home = deriveHomeViews(topicProgress, new Date());

  return (
    <FoundationShell active="Home">
      <NomiGreeting name={displayName} />

      <ContinueLearningCard
        subject={enrolledSubject}
        currentTopic={home.recentTopicNames[0]}
        nextTopic={home.recentTopicNames[1]}
      />

      <NomiRecommendation
        intervention={home.recommendation?.intervention}
        topicName={home.recommendation?.topicName}
      />

      <SubjectCard subjects={DISPLAY_SUBJECTS} activeSubject={enrolledSubject} />

      <RecentLearning
        records={home.recentLearning.map((record) => ({
          topic: record.topic,
          lastPractised: record.lastPracticedLabel,
        }))}
      />
    </FoundationShell>
  );
}