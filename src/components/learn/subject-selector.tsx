"use client";

import { SubjectIcon } from "@/components/ui/subject-icon";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { subjectIdentityForIconKey } from "@/components/ui/subject-identity";

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
      <Eyebrow className="mb-3">Choose a subject</Eyebrow>
      <div className="flex snap-x gap-2 overflow-x-auto pb-1.5 pl-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:p-0">
        {subjects.map((subject) => {
          const isSelected = subject.slug === selected;
          const identity = subjectIdentityForIconKey(subject.iconKey);

          return (
            <Button
              key={subject.slug}
              type="button"
              aria-pressed={isSelected}
              size="sm"
              variant="secondary"
              onClick={() => onSelect(subject.slug)}
              className="shrink-0 snap-start"
              style={
                isSelected
                  ? {
                      backgroundColor: identity.soft,
                      borderColor: identity.color,
                    }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                style={isSelected ? { color: identity.color } : undefined}
              >
                <SubjectIcon iconKey={subject.iconKey} size={15} strokeWidth={2} />
              </span>
              {subject.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}