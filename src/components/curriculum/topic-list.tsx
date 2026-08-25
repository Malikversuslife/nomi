import type { TopicNode } from "@/domain/subjects/topic-tree";

export function TopicList({ topics }: { topics: TopicNode[] }) {
  if (topics.length === 0) {
    return <p className="text-sm text-nomi-muted">No topics seeded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {topics.map((topic) => (
        <li key={topic.id} className="rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-white/70 p-3">
          <p className="font-semibold text-nomi-ink">{topic.name}</p>
          {topic.children.length > 0 ? <div className="mt-2 border-l-2 border-nomi-purple-100 pl-3"><TopicList topics={topic.children} /></div> : null}
        </li>
      ))}
    </ul>
  );
}
