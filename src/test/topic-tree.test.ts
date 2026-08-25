import { describe, expect, it } from "vitest";
import { buildTopicTree } from "@/domain/subjects/topic-tree";
import type { Topic } from "@/server/supabase/types";

const baseTopic = {
  description: null,
  active: true,
  created_at: "2026-08-25T00:00:00.000Z",
  updated_at: "2026-08-25T00:00:00.000Z",
} satisfies Partial<Topic>;

function topic(input: Pick<Topic, "id" | "subject_id" | "parent_topic_id" | "slug" | "name" | "depth" | "sort_order">): Topic {
  return { ...baseTopic, ...input } as Topic;
}

describe("buildTopicTree", () => {
  it("builds a sorted hierarchy within the same subject", () => {
    const tree = buildTopicTree([
      topic({ id: "factorisation", subject_id: "math", parent_topic_id: "quadratics", slug: "factorisation", name: "Factorisation", depth: 2, sort_order: 20 }),
      topic({ id: "algebra", subject_id: "math", parent_topic_id: null, slug: "algebra", name: "Algebra", depth: 0, sort_order: 10 }),
      topic({ id: "quadratics", subject_id: "math", parent_topic_id: "algebra", slug: "quadratics", name: "Quadratic equations", depth: 1, sort_order: 10 }),
      topic({ id: "formula", subject_id: "math", parent_topic_id: "quadratics", slug: "quadratic-formula", name: "Quadratic formula", depth: 2, sort_order: 10 }),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children.map((child) => child.name)).toEqual(["Quadratic formula", "Factorisation"]);
  });

  it("does not attach a topic to a parent from another subject", () => {
    const tree = buildTopicTree([
      topic({ id: "motion", subject_id: "physics", parent_topic_id: null, slug: "motion", name: "Motion", depth: 0, sort_order: 10 }),
      topic({ id: "bad-child", subject_id: "math", parent_topic_id: "motion", slug: "bad-child", name: "Bad child", depth: 1, sort_order: 10 }),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(0);
  });
});
