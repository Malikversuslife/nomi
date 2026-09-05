import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/not-found/back-button";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <section className="w-full max-w-xl text-center">
        <NomiWordmark width={144} variant="purple" label="Nomi" className="mx-auto" />
        <NomiCharacter state="curious" size={180} surface="light" className="mx-auto mt-10" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-700">Page not found</p>
        <h1 className="mx-auto mt-3 max-w-[31rem] font-display text-4xl font-bold tracking-[-0.05em] text-nomi-ink sm:text-5xl">
          Hmm, this page wandered off.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-nomi-muted">
          We couldn&apos;t find what you were looking for. Let&apos;s get you back to learning.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-nomi-on-primary transition-colors hover:bg-nomi-purple-700 active:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-2"
            href="/"
          >
            Go home
          </Link>
          <BackButton />
        </div>
      </section>
    </main>
  );
}
