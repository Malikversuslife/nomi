import Link from "next/link";
import { CircleCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { SubjectIcon } from "@/components/ui/subject-icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SUBJECT_IDENTITIES, type SubjectKey } from "@/components/ui/subject-identity";

const subjectKeys: SubjectKey[] = ["mathematics", "physics", "chemistry", "biology"];

export function SubjectCard({
  subjects,
  activeSubject,
}: {
  subjects: string[];
  activeSubject?: string;
}) {
  const tiles = subjectKeys
    .filter((key) => subjects.includes(SUBJECT_IDENTITIES[key].name))
    .map((key) => SUBJECT_IDENTITIES[key]);

  return (
    <section className="mb-5 sm:mb-6">
      <Eyebrow className="mb-1">Explore subjects</Eyebrow>
      <p className="mb-3 text-sm text-nomi-muted sm:mb-4">Choose something to practise.</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {tiles.map((identity) => {
          const isActive = identity.name === activeSubject;

          return (
            <Link
              key={identity.key}
              href="/learn"
              className={`
                relative flex min-h-24 flex-col justify-between gap-3 rounded-[var(--nomi-radius-large)] border p-4
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2
              `}
              style={{
                backgroundColor: identity.soft,
                borderColor: identity.color,
                boxShadow: isActive ? `0 0 0 2px ${identity.color}` : undefined,
              }}
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-nomi-surface/70"
                style={{ color: identity.color }}
              >
                <SubjectIcon
                  iconKey={identity.iconKey}
                  className="h-6 w-6"
                  size={22}
                  strokeWidth={2}
                />
              </span>

              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: identity.color }}
                >
                  <AppIcon icon={CircleCheckIcon} className="text-white" size={14} strokeWidth={3} />
                </span>
              ) : null}

              <span className="text-sm font-semibold tracking-[-0.01em] text-nomi-ink">
                {identity.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}