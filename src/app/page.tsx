import Link from "next/link";
import { NomiCharacter } from "@/components/nomi/nomi-character";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <section className="min-w-0 w-full max-w-md overflow-hidden rounded-[var(--nomi-radius-feature)] border border-nomi-border bg-nomi-surface lg:grid lg:max-w-5xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-700">
            Your learning companion
          </p>
          <h1 className="mt-4 max-w-full font-display text-3xl font-bold tracking-[-0.05em] text-nomi-ink sm:max-w-lg sm:text-5xl">
            Learns how you learn.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-nomi-muted">
            Nomi is your adaptive learning companion. The more you learn, the better Nomi understands how to help you learn.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-nomi-on-primary transition-colors hover:bg-nomi-purple-700 active:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2" href="/auth/sign-in">
              Sign in
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-5 font-semibold text-nomi-ink transition-colors hover:border-nomi-purple-500 hover:bg-nomi-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2" href="/auth/sign-up">
              Create account
            </Link>
          </div>
        </div>
        <div
          className="flex min-h-48 min-w-0 flex-col items-start justify-between bg-nomi-purple-600 p-6 text-nomi-on-primary sm:min-h-56 sm:flex-row sm:items-end sm:p-8 lg:min-h-[620px] lg:border-l lg:border-nomi-border lg:p-12"
          style={{ background: "linear-gradient(145deg, var(--nomi-purple-700), var(--nomi-purple-600))" }}
        >
          <p className="max-w-48 text-sm font-medium leading-6 text-white/80">Made to meet you where you are.</p>
          <NomiCharacter
            state="encouraging"
            size={128}
            surface="brand"
            label="Nomi is ready to learn with you"
            className="mt-6 mr-3 mb-2 self-end shrink-0 sm:mt-0 lg:mr-6 lg:mb-4"
          />
        </div>
      </section>
    </main>
  );
}
