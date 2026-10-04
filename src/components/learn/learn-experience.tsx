"use client";

import { useEffect, useState } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { LearnExperienceData } from "@/domain/learn/types";
import { LearnContinueCard } from "./learn-continue-card";
import { NomiLearnInsight } from "./nomi-learn-insight";
import { LearningPath } from "./learning-path";
import { Button, ButtonLink } from "@/components/ui/button";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { SubjectCatalogue } from "@/components/subjects/subject-catalogue";
import { AppIcon } from "@/components/ui/app-icon";

type MobilePath = {
  subjectName: string;
  currentTopic: { id: string; name: string; parentName: string | null; mastery: number; difficulty: number } | null;
  topics: { id: string; name: string; mastery: number; state: "completed" | "current" | "next" | "locked" }[];
};

export function LearnExperience({ data, mobilePath, addSubjectAction }: { data: LearnExperienceData; mobilePath?: MobilePath; addSubjectAction?: (formData: FormData) => Promise<void> }) {
  const [modalSubjectSlug, setModalSubjectSlug] = useState<string | null>(null);
  const modalSubject = data.subjects.find((subject) => subject.slug === modalSubjectSlug) ?? null;

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-nomi-purple-600">Learn</p>
        <h1 className="mt-2 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.05em] text-nomi-ink sm:text-[3.5rem]">Build it one idea at a time.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-nomi-muted">
          Your curriculum stays structured while Nomi adapts the depth, difficulty and next step around your evidence.
        </p>
      </header>

      {mobilePath ? <>
        <section className="nomi-feature rounded-[var(--nomi-radius-feature)] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Active subject</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-nomi-ink">{mobilePath.subjectName}</h2>
          <p className="mt-2 text-sm text-nomi-muted">Nomi follows this curriculum path and adapts from your assessed answers.</p>
        </section>
        {mobilePath.currentTopic ? <section className="nomi-card rounded-[var(--nomi-radius-feature)] p-7">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Current topic · {mobilePath.currentTopic.parentName ?? mobilePath.subjectName}</p><h2 className="mt-2 font-display text-3xl font-bold text-nomi-ink">{mobilePath.currentTopic.name}</h2><p className="mt-2 text-sm text-nomi-muted">{mobilePath.currentTopic.mastery}/100 mastery · {mobilePath.currentTopic.difficulty}/10 difficulty</p></div><NomiCharacter state="encouraging" size={70} /></div>
          <div className="mt-5 h-1.5 rounded-full bg-nomi-purple-50"><div className="h-full rounded-full bg-nomi-purple-600" style={{ width: `${mobilePath.currentTopic.mastery}%` }} /></div>
          <div className="mt-5 flex flex-wrap gap-2"><ButtonLink href={`/practice?topic=${encodeURIComponent(mobilePath.currentTopic.id)}`}>Continue practice</ButtonLink><ButtonLink href={`/nomi?topic=${encodeURIComponent(mobilePath.currentTopic.id)}`} variant="secondary">Learn with Nomi</ButtonLink></div>
        </section> : null}
        <section><div className="mb-3 flex justify-between text-xs font-bold uppercase tracking-[0.12em] text-nomi-muted"><span>Your path</span><span className="text-nomi-purple-600">{mobilePath.topics.filter((topic) => topic.state === "completed").length}/{mobilePath.topics.length}</span></div><div className="space-y-2.5">{mobilePath.topics.map((topic, index) => <div key={topic.id} className={`nomi-card flex items-center gap-3 rounded-[var(--nomi-radius-large)] p-4.5 ${topic.state === "locked" ? "opacity-60" : ""}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${topic.state === "current" ? "bg-nomi-purple-600 text-white shadow-[0_4px_12px_rgb(108_60_255/0.22)]" : "bg-nomi-purple-100 text-nomi-purple-600"}`}>{topic.state === "completed" ? "✓" : index + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold tracking-[-0.01em] text-nomi-ink">{topic.name}</p><p className="mt-0.5 text-sm text-nomi-muted">{topic.state === "completed" ? `${topic.mastery}/100 mastery` : topic.state === "current" ? "Current step" : topic.state === "next" ? "Ready after your current step" : "Progress through the path to unlock"}</p></div>{topic.state === "completed" || topic.state === "current" ? <ButtonLink href={`/practice?topic=${encodeURIComponent(topic.id)}`} variant="secondary" size="sm">Practise</ButtonLink> : null}</div>)}</div></section>
      </> : <LearnContinueCard view={data.continueView} />}

      {data.insightView ? <NomiLearnInsight view={data.insightView} topicSlug={data.continueView.kind === "continue" && data.continueView.topicName === data.insightView.topicName ? data.continueView.topicId ?? data.continueView.topicSlug : undefined} /> : null}

      <section className="border-t border-nomi-border pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Subject catalogue</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink">Find your next subject</h2>
        <p className="mb-5 mt-1 text-sm text-nomi-muted">Search by name or field. Subjects with complete learning paths can be added immediately.</p>
        <SubjectCatalogue subjects={data.subjects} selected={modalSubject?.slug ?? null} onSelect={setModalSubjectSlug} />
      </section>

      {modalSubject ? <SubjectInfoModal subject={modalSubject} addSubjectAction={addSubjectAction} onClose={() => setModalSubjectSlug(null)} /> : null}
    </div>
  );
}

function SubjectInfoModal({ subject, addSubjectAction, onClose }: {
  subject: LearnExperienceData["subjects"][number];
  addSubjectAction?: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const comingSoon = subject.availability === "coming_soon";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label="Close subject details" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <section role="dialog" aria-modal="true" aria-labelledby="subject-modal-title" className="nomi-card relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] p-6 shadow-[var(--nomi-shadow-float)] sm:rounded-[2rem] sm:p-8">
        <button type="button" aria-label="Close subject modal" onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-nomi-border bg-nomi-surface text-nomi-ink transition hover:bg-nomi-surface-raised">
          <AppIcon icon={Cancel01Icon} size={20} />
        </button>
        <div className="grid gap-6 pr-12 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-nomi-purple-600">{subject.field ?? "Subject"}</p>
            <h2 id="subject-modal-title" className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-nomi-ink">{subject.name}</h2>
            {subject.description ? <p className="mt-3 text-sm leading-6 text-nomi-muted">{subject.description}</p> : null}
          </div>
          <NomiCharacter state={comingSoon ? "thinking" : "encouraging"} size={92} label={comingSoon ? "Nomi is preparing this subject" : "Nomi is ready to help"} className="mx-auto" />
        </div>

        {comingSoon ? (
          <div className="mt-6 rounded-[var(--nomi-radius-large)] bg-nomi-purple-50 p-5">
            <p className="font-semibold text-nomi-ink">Nomi is preparing this learning path.</p>
            <p className="mt-1 text-sm leading-6 text-nomi-muted">It will become selectable as soon as the curriculum and assessed practice questions are ready.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!subject.enrolled && addSubjectAction ? <form action={addSubjectAction}><input type="hidden" name="subjectSlug" value={subject.slug} /><Button type="submit">Add to my subjects</Button></form> : subject.enrolled ? <span className="rounded-full bg-nomi-success-100 px-3 py-2 text-sm font-semibold text-nomi-success-500">In your subjects</span> : null}
              <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
            </div>
            <div className="mt-6 border-t border-nomi-border pt-2"><LearningPath subject={subject} /></div>
          </>
        )}
      </section>
    </div>
  );
}
