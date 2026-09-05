import type { ReactNode } from "react";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";

type AuthPageShellProps = {
  mode: "sign-in" | "sign-up";
  children: ReactNode;
};

const content = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Learning that adapts to you.",
    description: "Pick up where you left off and keep building.",
    formTitle: "Sign in to Nomi",
    formDescription: "Continue with your email and password.",
    character: "encouraging" as const,
    characterLabel: "Nomi is encouraging",
  },
  "sign-up": {
    eyebrow: "Made for your learning",
    title: "Learning made for the way you learn.",
    description: "Start with what you know. Nomi adapts as you go.",
    formTitle: "Create your account",
    formDescription: "A few details and you are ready to start.",
    character: "curious" as const,
    characterLabel: "Nomi is curious",
  },
};

export function AuthPageShell({ mode, children }: AuthPageShellProps) {
  const copy = content[mode];

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[var(--nomi-radius-feature)] border border-nomi-border bg-nomi-surface lg:grid lg:max-w-5xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside
          className="relative hidden min-h-[620px] overflow-hidden bg-nomi-purple-600 p-12 text-nomi-on-primary lg:flex lg:flex-col"
          aria-label="About Nomi"
          style={{ background: "linear-gradient(145deg, var(--nomi-purple-700), var(--nomi-purple-600))" }}
        >
          <NomiWordmark width={156} variant="inverse" label="Nomi" className="relative" />
          <div className="relative mt-auto max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{copy.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.05em]">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-xs text-base leading-7 text-white/80">{copy.description}</p>
          </div>
          <div className="relative mt-6 mb-4 mr-6 flex justify-end">
            <NomiCharacter state={copy.character} size={128} surface="brand" label={copy.characterLabel} />
          </div>
        </aside>

        <section className="flex min-h-full flex-col justify-center bg-nomi-surface p-6 sm:p-8 lg:border-l lg:border-nomi-border lg:p-12" aria-labelledby="auth-heading">
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <NomiWordmark width={144} variant="purple" label="Nomi" className="mx-auto lg:hidden" />
            <h1 id="auth-heading" className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink">
              {copy.formTitle}
            </h1>
            <p className="text-nomi-muted">{copy.formDescription}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
