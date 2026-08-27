import type { OnboardingStartingTopic } from "./types";

export type OnboardingTopicNode = {
  id: string;
  name: string;
  children: OnboardingTopicNode[];
};

/**
 * Deterministically picks the learner's first topic: the first leaf of the
 * canonical topic tree in existing sort order. The tree is already sorted by
 * sort_order when built, so this never invents a placement. Only display names
 * are returned - no ids or slugs leave this boundary.
 */
export function findStartingTopic(
  subjectName: string,
  topics: OnboardingTopicNode[],
): OnboardingStartingTopic | null {
  const visit = (
    nodes: OnboardingTopicNode[],
    unitName: string,
    groupName: string | null,
  ): Omit<OnboardingStartingTopic, "subjectName"> | null => {
    for (const node of nodes) {
      if (node.children.length === 0) {
        return { unitName, groupName, topicName: node.name };
      }

      const found = visit(node.children, unitName, node.name);
      if (found) {
        return found;
      }
    }

    return null;
  };

  for (const root of topics) {
    const found = visit(root.children, root.name, null);
    if (found) {
      return { subjectName, ...found };
    }
  }

  return null;
}