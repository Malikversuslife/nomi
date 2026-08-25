import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-[calc(6rem+var(--nomi-safe-bottom))] pt-[calc(2rem+var(--nomi-safe-top))] sm:max-w-2xl sm:px-8 lg:max-w-5xl">
      <section className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 shadow-sm sm:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Nomi</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-5xl">
          Learns how you learn.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-nomi-muted">
          The Supabase, auth, and curriculum foundation is ready for verification. Adaptive learning, AI, practice, and full product screens are intentionally not implemented yet.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-white px-5 font-semibold text-nomi-ink" href="/auth/sign-up">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
