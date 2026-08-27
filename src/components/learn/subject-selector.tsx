"use client";

import { Atom, BookOpen, Calculator, FlaskConical, Leaf } from "lucide-react";
import type { ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string }>;

const subjectIcons: Record<string, IconComponent> = {
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  leaf: Leaf,
};

export type SubjectSelectorOption = {
  slug: string;
  name: string;
  iconKey: string | null;
};

export function SubjectSelector({
  subjects,
  selected,
  onSelect,
}: {
  subjects: SubjectSelectorOption[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div role="group" aria-label="Choose a subject">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-nomi-purple-600">
        Choose a subject
      </p>
      <div className="flex snap-x gap-2 overflow-x-auto pb-1.5 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:p-0">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.iconKey ?? ""] ?? BookOpen;
          const isSelected = subject.slug === selected;

          return (
            <button
              key={subject.slug}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(subject.slug)}
              className={`
                inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-[var(--nomi-radius-pill)] border px-4 text-sm font-semibold transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2
                ${
                  isSelected
                    ? "border-nomi-purple-600 bg-nomi-purple-600 text-white"
                    : "border-nomi-border bg-nomi-surface text-nomi-ink hover:border-nomi-purple-500 hover:bg-nomi-purple-100"
                }
              `}
            >
              <span aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
              {subject.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}