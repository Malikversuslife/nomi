"use client";

import { useState } from "react";
import type { LearnExperienceData } from "@/domain/learn/types";
import { LearnContinueCard } from "./learn-continue-card";
import { NomiLearnInsight } from "./nomi-learn-insight";
import { SubjectSelector } from "./subject-selector";
import { LearningPath } from "./learning-path";

export function LearnExperience({ data }: { data: LearnExperienceData }) {
  const [selectedSlug, setSelectedSlug] = useState(
    data.defaultSubjectSlug ?? data.subjects[0]?.slug ?? "",
  );
  const subject =
    data.subjects.find((s) => s.slug === selectedSlug) ?? data.subjects[0] ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-5xl">
          Learn
        </h1>
        <p className="mt-2 text-sm text-nomi-muted">
          Choose a subject and keep building your path.
        </p>
      </header>

      <LearnContinueCard view={data.continueView} />

      {data.insightView ? <NomiLearnInsight view={data.insightView} /> : null}

      <SubjectSelector
        subjects={data.subjects.map((s) => ({
          slug: s.slug,
          name: s.name,
          iconKey: s.iconKey,
        }))}
        selected={subject?.slug ?? ""}
        onSelect={setSelectedSlug}
      />

      {subject ? (
        <section>
          <div aria-live="polite">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">
              {subject.name}
            </h2>
            {subject.description ? (
              <p className="mt-1 text-sm text-nomi-muted">{subject.description}</p>
            ) : null}
          </div>
          <LearningPath subject={subject} />
        </section>
      ) : null}
    </div>
  );
}