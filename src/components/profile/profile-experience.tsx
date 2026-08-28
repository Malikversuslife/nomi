import type { ProfileExperienceData } from "@/domain/profile/types";
import {
  answeredSentence,
  explanationStyleLabel,
  goalLabel,
  practisedSentence,
} from "@/domain/profile/presentation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";

function ProfileAvatar({ name }: { name: string }) {
  const initial = name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : "N";

  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-nomi-purple-100 text-2xl font-bold text-nomi-purple-700"
    >
      {initial}
    </div>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-nomi-muted">{label}</span>
      <span className="text-right text-sm font-medium text-nomi-ink">{value}</span>
    </div>
  );
}

export function ProfileExperience({ data }: { data: ProfileExperienceData }) {
  const explanationStyle = explanationStyleLabel(data.preferences.explanationStyle);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-5xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-nomi-muted">
          Who you are, and what you&apos;ve been practising with Nomi.
        </p>
      </header>

      <section className="flex items-center gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
        <ProfileAvatar name={data.displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-nomi-ink">{data.displayName}</p>
          <p className="truncate text-sm text-nomi-muted">{data.email}</p>
          {data.memberSinceLabel ? (
            <p className="mt-0.5 text-xs text-nomi-muted">
              Member since {data.memberSinceLabel}
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <Eyebrow className="mb-1">Recent learning</Eyebrow>
        <p className="text-sm leading-6 text-nomi-ink">
          {practisedSentence(data.summary)}
        </p>
        <p className="mt-0.5 text-sm leading-6 text-nomi-muted">
          {answeredSentence(data.summary)}
        </p>
      </section>

      <section>
        <Eyebrow className="mb-1">Recent topics</Eyebrow>
        {data.summary.recentTopics.length > 0 ? (
          <ul className="divide-y divide-nomi-border-subtle">
            {data.summary.recentTopics.map((topic) => (
              <li
                key={topic.name}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="truncate text-sm font-medium text-nomi-ink">
                  {topic.name}
                </span>
                <span className="shrink-0 text-xs text-nomi-muted">
                  {topic.lastPracticedLabel}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-nomi-muted">
            Complete a practice session and your recent topics will appear here.
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="How Nomi teaches you"
          title="Learning preferences"
          description="The details Nomi keeps in mind when explaining things to you."
        />
        <div className="mt-4 divide-y divide-nomi-border-subtle rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface px-5">
          <PreferenceRow
            label="Grade or year"
            value={data.preferences.gradeYear ?? "Not set"}
          />
          <PreferenceRow
            label="Daily practice goal"
            value={goalLabel(data.preferences.dailyGoalMinutes)}
          />
          <PreferenceRow
            label="Explanation style"
            value={explanationStyle ?? "Not set"}
          />
        </div>
        <div className="mt-4">
          <ButtonLink href="/settings" variant="secondary">
            Edit preferences
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}