import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  NOMI_CHARACTER_ASSETS,
  NOMI_CHARACTER_SIZES,
  NOMI_CHARACTER_STATES,
  NomiCharacter,
  type NomiCharacterState,
} from "@/components/nomi/nomi-character";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";

export const metadata: Metadata = {
  title: "Character Lab",
};

type SwatchTone = "transparent" | "cream" | "surface" | "lavender" | "purple";

const SWATCH_CLASSES: Record<SwatchTone, string> = {
  transparent: "bg-[linear-gradient(45deg,var(--nomi-stone)_25%,transparent_25%,transparent_75%,var(--nomi-stone)_75%),linear-gradient(45deg,var(--nomi-stone)_25%,transparent_25%,transparent_75%,var(--nomi-stone)_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]",
  cream: "bg-nomi-background",
  surface: "border border-nomi-border bg-nomi-surface",
  lavender: "bg-nomi-purple-100",
  purple: "bg-nomi-purple-600",
};

function Swatch({
  tone,
  children,
  className,
}: {
  tone: SwatchTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[var(--nomi-radius-medium)] ${SWATCH_CLASSES[tone]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function StateCard({ state }: { state: NomiCharacterState }) {
  const filename = NOMI_CHARACTER_ASSETS[state].split("/").at(-1);

  return (
    <article className="rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-4">
      <h3 className="text-sm font-semibold capitalize text-nomi-ink">{state}</h3>
      <p className="mt-0.5 text-xs text-nomi-muted">{filename}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Swatch tone="transparent" className="h-28">
          <NomiCharacter state={state} size={72} label={`Nomi is ${state}`} />
        </Swatch>
        <Swatch tone="cream" className="h-28">
          <NomiCharacter state={state} size={72} />
        </Swatch>
        <Swatch tone="lavender" className="h-28">
          <NomiCharacter state={state} size={72} />
        </Swatch>
        <Swatch tone="purple" className="h-28">
          <NomiCharacter state={state} size={72} surface="brand" />
        </Swatch>
      </div>
    </article>
  );
}

export default function CharacterLabPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-700">
        Development review surface
      </p>
      <h1 className="mt-1 font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink">
        Nomi character lab
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-nomi-muted">
        Production review of the approved extracted PNG assets. These are the same mood files used
        by the application, not reconstructed SVG artwork.
      </p>

      <section className="mt-10" aria-labelledby="identity-heading">
        <h2 id="identity-heading" className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
          Product identity and companion
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <NomiWordmark width={150} variant="purple" label="Nomi" />
            <p className="text-sm leading-5 text-nomi-muted">Approved product wordmark asset.</p>
          </div>
          <div className="flex items-center gap-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-5">
            <NomiCharacter state="neutral" size={80} />
            <p className="text-sm leading-5 text-nomi-muted">Approved learning-companion asset.</p>
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="states-heading">
        <h2 id="states-heading" className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
          Canonical mood assets
        </h2>
        <p className="mt-1 text-sm text-nomi-muted">
          Every card renders the extracted file on transparency, Cream, Lavender, and Purple. Mood
          assets retain their intentional questions, hearts, confetti, challenge marks, and review symbol.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NOMI_CHARACTER_STATES.map((state) => (
            <StateCard key={state} state={state} />
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sizes-heading">
        <h2 id="sizes-heading" className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
          Size ladder
        </h2>
        <div className="mt-5 flex flex-wrap items-end gap-5">
          {NOMI_CHARACTER_SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Swatch tone="cream" className="h-32 w-28">
                <NomiCharacter state="neutral" size={size} />
              </Swatch>
              <p className="text-xs text-nomi-muted">{size}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="contexts-heading">
        <h2 id="contexts-heading" className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
          Real-size contexts
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Swatch tone="surface" className="h-32">
            <div className="flex items-center gap-3">
              <NomiCharacter state="neutral" size="sm" />
              <span className="text-sm font-semibold text-nomi-ink">Assistant identity</span>
            </div>
          </Swatch>
          <Swatch tone="lavender" className="h-32">
            <div className="flex items-center gap-3">
              <NomiCharacter state="thinking" size="lg" />
              <span className="text-sm font-semibold text-nomi-ink">Guidance moment</span>
            </div>
          </Swatch>
          <Swatch tone="purple" className="h-32">
            <NomiCharacter state="celebrating" size="xl" surface="brand" />
          </Swatch>
        </div>
      </section>
    </main>
  );
}
