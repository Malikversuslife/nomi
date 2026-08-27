import "server-only";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { getProfile } from "@/server/data/learner";
import { findStartingTopic, type OnboardingTopicNode } from "@/domain/onboarding/presentation";
import type { OnboardingExperienceData, OnboardingSubjectView } from "@/domain/onboarding/types";

export async function buildOnboardingExperience(
  userId: string,
): Promise<OnboardingExperienceData> {
  const [profile, subjectsWithTopics] = await Promise.all([
    getProfile(userId),
    getSubjectsWithTopicHierarchy(),
  ]);

  const subjects: OnboardingSubjectView[] = subjectsWithTopics.map((subject) => {
    const toNode = (node: (typeof subjectsWithTopics)[number]["topics"][number]): OnboardingTopicNode => ({
      id: node.id,
      name: node.name,
      children: node.children.map(toNode),
    });

    return {
      slug: subject.slug,
      name: subject.name,
      description: subject.description,
      iconKey: subject.icon_key,
      startingTopic: findStartingTopic(subject.name, subject.topics.map(toNode)),
    };
  });

  return {
    displayName: profile?.display_name?.trim() || null,
    subjects,
  };
}