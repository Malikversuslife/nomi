"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { SubjectIcon } from "@/components/ui/subject-icon";

export type CatalogueSubject = {
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  field?: string;
  searchTerms?: string[];
  availability?: "available" | "coming_soon";
  artworkKind?: "3d" | "icon";
  enrolled?: boolean;
};

export function SubjectCatalogue({ subjects, selected, onSelect, selectionMode = "browse" }: {
  subjects: CatalogueSubject[];
  selected: string | null;
  onSelect: (slug: string) => void;
  selectionMode?: "onboarding" | "browse";
}) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All");
  const fieldRailRef = useRef<HTMLDivElement>(null);
  const fields = useMemo(() => ["All", ...Array.from(new Set(subjects.map((subject) => subject.field ?? "Other"))).sort()], [subjects]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return subjects.filter((subject) => {
      const matchesField = field === "All" || (subject.field ?? "Other") === field;
      const haystack = [subject.name, subject.description ?? "", subject.field ?? "Other", ...(subject.searchTerms ?? [])].join(" ").toLocaleLowerCase();
      return matchesField && (!term || haystack.includes(term));
    });
  }, [field, query, subjects]);

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">Search subjects</span>
        <AppIcon icon={Search01Icon} size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-nomi-muted" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects" className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface/80 py-3 pl-11 pr-4 text-sm text-nomi-ink shadow-sm outline-none transition focus:border-nomi-purple-500 focus:ring-2 focus:ring-nomi-purple-100" />
      </label>

      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
        <button type="button" aria-label="Scroll subject fields left" onClick={() => fieldRailRef.current?.scrollBy({ left: -260, behavior: "smooth" })} className="flex h-10 w-10 items-center justify-center rounded-full border border-nomi-border bg-nomi-surface text-nomi-ink shadow-sm transition hover:bg-nomi-surface-raised active:scale-95">
          <AppIcon icon={ArrowLeft01Icon} size={18} />
        </button>
        <div ref={fieldRailRef} className="flex snap-x gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Subject fields">
          {fields.map((item) => (
            <button key={item} type="button" aria-pressed={field === item} onClick={() => setField(item)} className={`min-h-10 shrink-0 snap-start rounded-full border px-4 text-sm font-semibold transition ${field === item ? "border-nomi-purple-600 bg-nomi-purple-600 text-white" : "border-nomi-border bg-nomi-surface text-nomi-muted hover:bg-nomi-surface-subtle hover:text-nomi-ink"}`}>
              {item}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Scroll subject fields right" onClick={() => fieldRailRef.current?.scrollBy({ left: 260, behavior: "smooth" })} className="flex h-10 w-10 items-center justify-center rounded-full border border-nomi-border bg-nomi-surface text-nomi-ink shadow-sm transition hover:bg-nomi-surface-raised active:scale-95">
          <AppIcon icon={ArrowRight01Icon} size={18} />
        </button>
      </div>

      <div role={selectionMode === "onboarding" ? "radiogroup" : "group"} aria-label={selectionMode === "onboarding" ? "Choose a subject" : "Browse subjects"} className="grid gap-3 sm:grid-cols-2">
        {filtered.map((subject) => {
          const isSelected = selected === subject.slug;
          const unavailable = subject.availability === "coming_soon";
          const content = (
            <>
              <span className="flex h-13 w-13 shrink-0 items-center justify-center self-start rounded-2xl bg-nomi-purple-100 text-nomi-purple-600"><SubjectIcon iconKey={subject.iconKey} size={25} /></span>
              <span className="flex min-w-0 flex-1 flex-col self-stretch">
                <span className="font-semibold leading-5 text-nomi-ink">{subject.name}</span>
                <span className="mt-1 block text-xs font-semibold text-nomi-purple-600">{subject.field ?? "Other"}</span>
                {subject.description ? <span className="mt-1.5 line-clamp-2 block text-sm leading-5 text-nomi-muted">{subject.description}</span> : null}
                <span className="mt-auto pt-3">
                  {subject.enrolled ? <span className="inline-flex items-center gap-1 rounded-full bg-nomi-success-100 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-nomi-success-500"><AppIcon icon={Tick02Icon} size={13} />Added</span> : isSelected && selectionMode === "onboarding" ? <span className="inline-flex items-center gap-1 rounded-full bg-nomi-purple-100 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-nomi-purple-600"><AppIcon icon={Tick02Icon} size={13} />Selected</span> : unavailable ? <span className="inline-flex rounded-full bg-nomi-surface-subtle px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-nomi-muted">Coming soon</span> : <span className="text-xs font-semibold text-nomi-muted">View subject</span>}
                </span>
              </span>
            </>
          );

          if (selectionMode === "onboarding") {
            return (
              <label key={subject.slug} className={`grid min-h-36 grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-4 rounded-[var(--nomi-radius-large)] border p-5 text-left transition ${unavailable ? "cursor-not-allowed opacity-65" : "cursor-pointer"} ${isSelected ? "border-nomi-purple-600 bg-nomi-purple-100/60 ring-1 ring-nomi-purple-600" : "border-nomi-border bg-nomi-surface hover:border-nomi-purple-500"}`}>
                <input type="radio" name="subject" value={subject.slug} checked={isSelected} disabled={unavailable} onChange={() => onSelect(subject.slug)} className="sr-only" />
                {content}
              </label>
            );
          }
          return (
            <button key={subject.slug} type="button" aria-label={subject.name} aria-pressed={isSelected} onClick={() => onSelect(subject.slug)} className={`grid min-h-36 grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-4 rounded-[var(--nomi-radius-large)] border p-5 text-left transition ${isSelected ? "border-nomi-purple-600 bg-nomi-purple-100/60 ring-1 ring-nomi-purple-600" : "border-nomi-border bg-nomi-surface hover:border-nomi-purple-500"}`}>
              {content}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? <div className="rounded-[var(--nomi-radius-large)] border border-dashed border-nomi-border p-8 text-center"><p className="font-semibold text-nomi-ink">No subjects match that search.</p><button type="button" onClick={() => { setQuery(""); setField("All"); }} className="mt-2 text-sm font-semibold text-nomi-purple-600">Clear filters</button></div> : null}
    </div>
  );
}
