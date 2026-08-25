import type { Topic } from "@/server/supabase/types";

export type TopicNode = Topic & {
  children: TopicNode[];
};

export function buildTopicTree(topics: Topic[]): TopicNode[] {
  const nodes = new Map<string, TopicNode>();

  for (const topic of topics) {
    nodes.set(topic.id, { ...topic, children: [] });
  }

  const roots: TopicNode[] = [];

  for (const node of nodes.values()) {
    if (!node.parent_topic_id) {
      roots.push(node);
      continue;
    }

    const parent = nodes.get(node.parent_topic_id);

    if (parent && parent.subject_id === node.subject_id) {
      parent.children.push(node);
    }
  }

  const sortNodes = (items: TopicNode[]) => {
    items.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}
