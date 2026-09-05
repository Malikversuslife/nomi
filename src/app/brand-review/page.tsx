import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { ContinueLearningCard } from "@/components/learn/continue-learning-card";
import { LearnContinueCard } from "@/components/learn/learn-continue-card";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { NomiLogo } from "@/components/nomi/nomi-logo";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";
import { AppIcon } from "@/components/ui/app-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Subject3DVisual } from "@/components/ui/subject-visual";
import type { LearnContinueView } from "@/domain/learn/types";

export const metadata: Metadata = {
  title: "Brand Foundation Review",
};

const PALETTE = [
  ["Primary Purple", "#6C3CFF", "var(--nomi-purple-600)"],
  ["Mint", "#2BD4A1", "var(--nomi-mint-500)"],
  ["Yellow", "#FFD43B", "var(--nomi-yellow-500)"],
  ["Pink", "#FF8AAE", "var(--nomi-pink-500)"],
  ["Lavender", "#E9E6FF", "var(--nomi-purple-100)"],
  ["Ink", "#111827", "var(--nomi-ink)"],
  ["Slate", "#475569", "var(--nomi-muted)"],
  ["Stone", "#F2F2F7", "var(--nomi-stone)"],
  ["Cream", "#FFF9F2", "var(--nomi-background)"],
] as const;

const PREVIEW_LEARN_VIEW: LearnContinueView = {
  kind: "continue",
  subjectName: "Mathematics",
  parentName: "Number",
  topicName: "Fractions",
  state: {
    key: "in-progress",
    label: "In progress",
    cue: "You've made a start.",
    actionLabel: "Practise",
  },
};

const SUBJECT_PREVIEWS = ["mathematics", "physics", "chemistry", "biology"] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
      <h2
        id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}
        className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function BrandReviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-700">
        Development review surface
      </p>
      <h1 className="mt-1 font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink">
        Nomi brand foundation
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-nomi-muted">
        Canonical identity, palette, surfaces and illustration direction derived from the approved
        Nomi Brand Guide. This route is not part of product navigation.
      </p>

      <Section title="Primary button contract">
        <p className="text-sm text-nomi-muted">
          Real Button, ButtonLink and IconButton instances. Primary CTAs must keep white foreground
          (text-nomi-on-primary) on purple for text and icons; the secondary controls below must stay
          ink, proving no global whitening.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">ButtonLink primary - anchor, mirrors Home/Learn &quot;Continue practice&quot;</p>
            <ButtonLink href="/practice" className="mt-3">
              Continue practice
              <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
            </ButtonLink>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">Button primary - native, mirrors Practice actions</p>
            <Button className="mt-3">
              Continue
              <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
            </Button>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">Button primary disabled</p>
            <Button disabled className="mt-3">
              Continue
              <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
            </Button>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">IconButton primary</p>
            <IconButton variant="primary" aria-label="Continue" className="mt-3">
              <AppIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.25} />
            </IconButton>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">Button secondary - control, must stay ink</p>
            <Button variant="secondary" className="mt-3">
              Explore subjects
              <AppIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.25} />
            </Button>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <p className="text-xs font-medium text-nomi-muted">IconButton secondary - control, must stay muted</p>
            <IconButton aria-label="Open menu" className="mt-3">
              <AppIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.25} />
            </IconButton>
          </div>
        </div>
      </Section>

      <Section title="Product identity">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--nomi-radius-feature)] border border-nomi-border bg-nomi-background p-6">
            <p className="text-xs font-medium text-nomi-muted">Ink on Cream</p>
            <NomiWordmark width={180} className="mt-5" label="Nomi" />
          </div>
          <div className="rounded-[var(--nomi-radius-feature)] border border-nomi-border bg-nomi-background p-6">
            <p className="text-xs font-medium text-nomi-muted">Purple on Cream</p>
            <NomiWordmark width={180} variant="purple" className="mt-5" label="Nomi" />
          </div>
          <div
            className="rounded-[var(--nomi-radius-feature)] p-6"
            style={{ background: "linear-gradient(135deg, var(--nomi-purple-700), var(--nomi-purple-600))" }}
          >
            <p className="text-xs font-medium text-white/80">White on Purple</p>
            <NomiWordmark width={180} variant="inverse" className="mt-5" label="Nomi" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <NomiLogo variant="primaryLockup" width={190} label="Nomi Learns how you learn" />
            <p className="mt-3 text-xs text-nomi-muted">Approved primary lockup source asset</p>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <NomiLogo variant="horizontalLockup" width={220} label="Nomi" />
            <p className="mt-3 text-xs text-nomi-muted">Approved horizontal lockup source asset</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-5 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
          <NomiCharacter state="neutral" size={88} />
          <NomiWordmark width={180} variant="purple" label="Nomi" />
          <span className="text-sm text-nomi-muted">Character lockup for review only</span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <NomiWordmark width={112} variant="purple" label="Nomi" />
          <span className="text-xs text-nomi-muted">Compact mobile size</span>
          <NomiWordmark width={180} label="Nomi" className="ml-4" />
          <span className="text-xs text-nomi-muted">Desktop header size</span>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-5 rounded-[var(--nomi-radius-large)] bg-nomi-stone p-5">
          <p className="w-full text-xs font-semibold uppercase tracking-[0.18em] text-nomi-muted">
            Temporary small-size legibility check
          </p>
          {[80, 96, 112, 128].map((width) => (
            <div key={width} className="flex flex-col items-start gap-2">
              <NomiWordmark width={width} variant="purple" label="Nomi" />
              <span className="text-xs text-nomi-muted">{Math.round((width * 125) / 350)}px high</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Canonical palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PALETTE.map(([name, hex, color]) => (
            <div key={name} className="overflow-hidden rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface">
              <div className="h-16" style={{ backgroundColor: color }} />
              <div className="p-3">
                <p className="text-sm font-semibold text-nomi-ink">{name}</p>
                <p className="mt-0.5 text-xs text-nomi-muted">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--nomi-radius-large)] bg-nomi-surface p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-nomi-purple-700">
              Bricolage Grotesque Bold
            </p>
            <p className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-nomi-ink">
              Learning that feels made for you.
            </p>
          </div>
          <div className="rounded-[var(--nomi-radius-large)] bg-nomi-stone p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-nomi-muted">
              Inter Regular / Medium
            </p>
            <p className="mt-3 text-base leading-7 text-nomi-ink">
              Clear, calm UI and learning copy keeps the learner focused on what comes next.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Surfaces and depth">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-background p-5 text-sm text-nomi-ink">
            Cream Canvas
          </div>
          <div className="rounded-[var(--nomi-radius-large)] bg-nomi-surface p-5 text-sm text-nomi-ink shadow-sm">
            White Surface
          </div>
          <div className="rounded-[var(--nomi-radius-large)] bg-nomi-purple-100 p-5 text-sm text-nomi-ink">
            Lavender Learning State
          </div>
          <div
            className="rounded-[var(--nomi-radius-large)] p-5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--nomi-purple-700), var(--nomi-purple-600), var(--nomi-purple-500))" }}
          >
            Controlled Purple Brand Moment
          </div>
        </div>
      </Section>

      <Section title="Functional and learning iconography">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <span className="rounded-[var(--nomi-radius-medium)] bg-nomi-stone p-3 text-nomi-ink">
              <AppIcon icon={BookOpen01Icon} size={24} strokeWidth={2} />
            </span>
            <div>
              <p className="font-semibold text-nomi-ink">Functional UI</p>
              <p className="mt-1 text-sm text-nomi-muted">Hugeicons for navigation and controls.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-[var(--nomi-radius-large)] bg-nomi-purple-100 p-5">
            <Subject3DVisual subject="Mathematics" size="sm" />
            <div>
              <p className="font-semibold text-nomi-ink">Learning concept</p>
              <p className="mt-1 text-sm text-nomi-muted">Bespoke illustrated objects for subjects and moments.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Subject 3D illustration quality">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {SUBJECT_PREVIEWS.map((subject) => (
            <div key={subject}>
              <p className="mb-2 text-sm font-semibold capitalize text-nomi-ink">{subject}</p>
              <div className="flex flex-col gap-3">
                <div className="flex min-h-44 items-center justify-center rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-background p-4">
                  <Subject3DVisual subject={subject} size="md" />
                </div>
                <div className="flex min-h-44 items-center justify-center rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-4">
                  <Subject3DVisual subject={subject} size="md" />
                </div>
                <div className="flex min-h-44 items-center justify-center rounded-[var(--nomi-radius-large)] bg-nomi-purple-100 p-4">
                  <Subject3DVisual subject={subject} size="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Continue-learning card preview">
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-nomi-muted">Home card, desktop width</p>
            <div className="rounded-[var(--nomi-radius-feature)] bg-nomi-background p-4">
              <ContinueLearningCard subject="Mathematics" currentTopic="Fractions" nextTopic="Decimals" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-nomi-muted">Learn card, desktop width</p>
            <div className="rounded-[var(--nomi-radius-feature)] bg-nomi-background p-4">
              <LearnContinueCard view={PREVIEW_LEARN_VIEW} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-nomi-muted">Home card, mobile width</p>
            <div className="w-80 rounded-[var(--nomi-radius-feature)] bg-nomi-background p-4">
              <ContinueLearningCard subject="Mathematics" currentTopic="Fractions" nextTopic="Decimals" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-nomi-muted">Learn card, mobile width</p>
            <div className="w-80 rounded-[var(--nomi-radius-feature)] bg-nomi-background p-4">
              <LearnContinueCard view={PREVIEW_LEARN_VIEW} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Nomi companion">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex min-h-48 items-center justify-center rounded-[var(--nomi-radius-feature)] bg-nomi-background">
            <NomiCharacter state="encouraging" size={128} label="Nomi is encouraging" />
          </div>
          <div
            className="flex min-h-48 items-center justify-center rounded-[var(--nomi-radius-feature)]"
            style={{ background: "linear-gradient(135deg, var(--nomi-purple-700), var(--nomi-purple-600))" }}
          >
            <NomiCharacter state="celebrating" size={128} surface="brand" label="Nomi is celebrating" />
          </div>
        </div>
      </Section>
    </main>
  );
}
