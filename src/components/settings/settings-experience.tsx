import { signOutAction } from "@/server/auth/actions";
import type { ProfileExperienceData } from "@/domain/profile/types";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { updateProfileSettingsAction } from "@/server/profile/actions";
import { ProfilePreferencesForm } from "@/components/profile/profile-preferences-form";

function DetailRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-nomi-ink">{label}</p>
        <p className="mt-0.5 text-sm text-nomi-muted">{value}</p>
        {note ? <p className="mt-0.5 text-xs text-nomi-muted">{note}</p> : null}
      </div>
    </div>
  );
}

export function SettingsExperience({
  data,
}: {
  data: ProfileExperienceData;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-5xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-nomi-muted">
          What Nomi remembers about you, and how to manage your account.
        </p>
      </header>

      <section id="preferences" className="scroll-mt-20">
        <SectionHeader
          eyebrow="Learning preferences"
          title="How Nomi teaches you"
          description="These details shape the explanations Nomi gives you."
        />
        <div className="mt-4">
          <ProfilePreferencesForm
            preferences={data.preferences}
            action={updateProfileSettingsAction}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Account"
          title="Your account"
        />
        <div className="mt-4 divide-y divide-nomi-border-subtle rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface px-5">
          <DetailRow label="Email" value={data.email} note="Managed by your sign-in provider." />
          <DetailRow
            label="Member since"
            value={data.memberSinceLabel ?? "—"}
          />
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-nomi-ink">Sign out</p>
              <p className="mt-0.5 text-sm text-nomi-muted">
                Sign out of Nomi on this device.
              </p>
            </div>
            <form action={signOutAction}>
              <Button variant="secondary" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Appearance" title="Look and feel" />
        <div className="mt-4">
          <FeedbackBanner variant="info">
            Nomi follows your device&apos;s reduced-motion preference automatically.
          </FeedbackBanner>
        </div>
      </section>
    </div>
  );
}