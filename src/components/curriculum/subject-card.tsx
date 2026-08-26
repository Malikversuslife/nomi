import Link from "next/link";

const subjectEmojis: Record<string, string> = {
  Mathematics: "\u03C0",
  Physics: "\u26A1",
  Chemistry: "\u2697",
  Biology: "\uD83C\uDF3F",
};

export function SubjectCard({
  subjects,
  activeSubject,
}: {
  subjects: string[];
  activeSubject?: string;
}) {
  return (
    <section className="mb-5 sm:mb-6">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600 sm:mb-1">
        Explore subjects
      </p>
      <p className="mb-3 text-sm text-nomi-muted sm:mb-4">
        Choose something to practise.
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {subjects.map((subject) => (
          <Link
            key={subject}
            href="/learn"
            className={`
              group flex flex-col items-center gap-1.5 rounded-[var(--nomi-radius-large)] border px-3 py-4 text-center transition-all
              sm:gap-2 sm:px-4 sm:py-5
              ${subject === activeSubject
                ? "border-nomi-purple-200 bg-nomi-purple-50 shadow-sm"
                : "border-nomi-border bg-nomi-surface hover:border-nomi-purple-200 hover:shadow-sm"
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2
            `}
          >
            <span className="text-xl sm:text-2xl" aria-hidden="true">
              {subjectEmojis[subject] ?? "\uD83D\uDCD6"}
            </span>
            <span className="text-xs font-semibold text-nomi-ink group-hover:text-nomi-purple-700 transition-colors sm:text-sm">
              {subject}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
