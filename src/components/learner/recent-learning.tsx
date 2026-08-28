import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function RecentLearning({
  records,
}: {
  records: Array<{ topic: string; lastPractised: string } | undefined>;
}) {
  if (records.length === 0) {
    return (
      <section className="pt-1">
        <Eyebrow className="mb-1">Recent learning</Eyebrow>
        <p className="text-sm font-semibold text-nomi-ink">Nothing here yet</p>
        <p className="mt-1 max-w-md text-sm text-nomi-muted">
          Complete a practice session and your recent learning will appear here.
        </p>
        <ButtonLink
          href="/practice"
          variant="secondary"
          className="mt-3"
          size="sm"
        >
          Start practising
        </ButtonLink>
      </section>
    );
  }

  return (
    <section>
      <Eyebrow className="mb-3">Recent learning</Eyebrow>
      <ul className="divide-y divide-nomi-border-subtle">
        {records.map((record, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <span className="truncate text-sm font-medium text-nomi-ink">
              {record?.topic}
            </span>
            <span className="shrink-0 text-xs text-nomi-muted">
              {record?.lastPractised}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}