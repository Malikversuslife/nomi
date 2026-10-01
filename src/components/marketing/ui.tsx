"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { NomiCharacter, type NomiCharacterState } from "@/components/nomi/nomi-character";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";
import { SUBJECT_3D_ASSETS } from "@/components/ui/subject-visual";
import type { SubjectKey } from "@/components/ui/subject-identity";

export function Wordmark({ className = "h-8" }: { className?: string }) {
  return (
    <>
      <NomiWordmark variant="purple" width={112} label="Nomi" className={`${className} w-auto dark:!hidden`} />
      <NomiWordmark variant="inverse" width={112} label="Nomi" className={`${className} !hidden w-auto dark:!block`} />
    </>
  );
}

/** Approved static mascot that wiggles when hovered or tapped. */
export function Mascot({ mood, alt = "", className = "", eager = false }: { mood: string; alt?: string; className?: string; eager?: boolean }) {
  const [k, setK] = useState(0);
  const bump = () => setK((n) => n + 1);
  return (
    <span key={k} onMouseEnter={bump} onClick={bump} className={`block cursor-pointer select-none ${k ? "anim-wiggle" : ""} ${className}`} data-eager={eager || undefined}>
      <NomiCharacter state={mood as NomiCharacterState} size={384} label={alt || undefined} className="h-auto w-full" />
    </span>
  );
}

export function SubjectArt({ subject, alt = "", className = "" }: { subject: string; alt?: string; className?: string }) {
  return <Image src={SUBJECT_3D_ASSETS[subject as SubjectKey]} alt={alt} width={1300} height={1147} sizes="208px" draggable={false} className={`h-auto select-none ${className}`} />;
}

const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] transition hover:brightness-105 active:translate-y-[3px] active:shadow-none";
export function Button({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" | "light"; className?: string }) {
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-[0_4px_0_#4a22d6]",
    ghost: "border-2 border-border border-b-4 bg-card text-primary hover:bg-muted active:border-b-2",
    light: "bg-white text-ink shadow-[0_4px_0_rgba(0,0,0,.25)]",
  }[variant];
  return <Link href={href} className={`${base} ${styles} ${className}`}>{children}</Link>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{children}</p>;
}
