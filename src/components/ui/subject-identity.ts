import type { IconSvgElement } from "@hugeicons/react";
import {
  Atom02Icon,
  BookOpen01Icon,
  Calculator01Icon,
  FlaskConicalIcon,
  Leaf04Icon,
} from "@hugeicons/core-free-icons";

export type SubjectKey = "mathematics" | "physics" | "chemistry" | "biology";

export interface SubjectIdentity {
  key: SubjectKey;
  name: string;
  iconKey: string;
  icon: IconSvgElement;
  color: string;
  soft: string;
}

const FALLBACK: SubjectIdentity = {
  key: "mathematics",
  name: "Mathematics",
  iconKey: "book",
  icon: BookOpen01Icon,
  color: "var(--nomi-purple-600)",
  soft: "var(--nomi-purple-100)",
};

export const SUBJECT_IDENTITIES: Record<SubjectKey, SubjectIdentity> = {
  mathematics: {
    key: "mathematics",
    name: "Mathematics",
    iconKey: "calculator",
    icon: Calculator01Icon,
    color: "var(--nomi-math)",
    soft: "var(--nomi-math-soft)",
  },
  physics: {
    key: "physics",
    name: "Physics",
    iconKey: "atom",
    icon: Atom02Icon,
    color: "var(--nomi-physics)",
    soft: "var(--nomi-physics-soft)",
  },
  chemistry: {
    key: "chemistry",
    name: "Chemistry",
    iconKey: "flask",
    icon: FlaskConicalIcon,
    color: "var(--nomi-chemistry)",
    soft: "var(--nomi-chemistry-soft)",
  },
  biology: {
    key: "biology",
    name: "Biology",
    iconKey: "leaf",
    icon: Leaf04Icon,
    color: "var(--nomi-biology)",
    soft: "var(--nomi-biology-soft)",
  },
};

const ICON_KEY_TO_SUBJECT: Record<string, SubjectKey> = {
  calculator: "mathematics",
  atom: "physics",
  flask: "chemistry",
  leaf: "biology",
};

export function subjectIdentityForSlug(slug: string | null | undefined): SubjectIdentity {
  const normalized = slug?.trim().toLowerCase() ?? "";
  const slugKey = normalized === "science" ? "biology" : normalized;
  return SUBJECT_IDENTITIES[slugKey as SubjectKey] ?? FALLBACK;
}

export function subjectIdentityForName(name: string | null | undefined): SubjectIdentity {
  return subjectIdentityForSlug(name);
}

export function subjectIdentityForIconKey(iconKey: string | null | undefined): SubjectIdentity {
  return subjectIdentityForSlug(ICON_KEY_TO_SUBJECT[iconKey ?? ""] ?? null);
}