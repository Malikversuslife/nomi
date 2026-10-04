"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Atom02Icon,
  BookOpen01Icon,
  ChartNoAxesColumnIncreasingIcon,
  ChatBotIcon,
  Home01Icon,
  Notification02Icon,
  ProfileIcon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AccountMenu } from "@/components/account/account-menu";
import { AppIcon } from "@/components/ui/app-icon";

type Account = { name: string | null; email: string | null } | null;
type Destination = { href: string; label: string; detail: string; icon: IconSvgElement };

const destinations: Destination[] = [
  { href: "/home", label: "Home", detail: "Your next learning step", icon: Home01Icon },
  { href: "/learn", label: "Learn", detail: "Subjects and learning paths", icon: BookOpen01Icon },
  { href: "/practice", label: "Practice", detail: "Adaptive assessed questions", icon: Atom02Icon },
  { href: "/nomi", label: "Nomi", detail: "Ask your learning companion", icon: ChatBotIcon },
  { href: "/progress", label: "Progress", detail: "Mastery and recent evidence", icon: ChartNoAxesColumnIncreasingIcon },
  { href: "/notifications", label: "Notifications", detail: "Learning updates", icon: Notification02Icon },
  { href: "/profile", label: "Profile", detail: "Your learner profile", icon: ProfileIcon },
  { href: "/settings", label: "Settings", detail: "Preferences and account", icon: Settings01Icon },
];

const sectionCopy: Record<string, { title: string; description: string }> = {
  Home: { title: "Home", description: "Your learning, ready when you are." },
  Learn: { title: "Learn", description: "Follow your path and explore each subject." },
  Practice: { title: "Practice", description: "Build confidence with questions that adapt to you." },
  Nomi: { title: "Nomi", description: "Get guidance grounded in your recent learning." },
  Progress: { title: "Progress", description: "See your mastery, momentum, and next step." },
  Settings: { title: "Settings", description: "Manage your learning preferences and appearance." },
};

export function DashboardHeader({ active, account }: { active: string; account: Account }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const copy = sectionCopy[active] ?? { title: "Nomi", description: "Your adaptive learning workspace." };
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? destinations.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(value))
      : destinations.slice(0, 5);
  }, [query]);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const goTo = (item: Destination) => {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  return (
    <header className="nomi-material sticky top-0 z-30 -mx-8 hidden min-h-20 items-center justify-between gap-8 border-b border-nomi-border-subtle px-8 xl:-mx-12 xl:px-12 lg:flex">
      <div className="min-w-0 shrink-0">
        <p className="text-lg font-semibold tracking-[-0.025em] text-nomi-ink">{copy.title}</p>
        <p className="mt-0.5 text-sm text-nomi-muted">{copy.description}</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div ref={searchRef} className="relative w-full max-w-sm">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (results[0]) goTo(results[0]);
            }}
          >
            <AppIcon icon={Search01Icon} size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-nomi-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search Nomi"
              aria-label="Search Nomi destinations"
              className="h-11 w-full rounded-full border border-nomi-border bg-nomi-surface-subtle pl-10 pr-12 text-sm text-nomi-ink outline-none transition-[background-color,border-color,box-shadow] placeholder:text-nomi-muted hover:bg-nomi-surface-raised focus:border-nomi-purple-500/40 focus:bg-nomi-surface focus:shadow-[0_0_0_4px_rgb(108_60_255/0.1)]"
            />
            <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-nomi-border bg-nomi-surface px-1.5 py-0.5 text-[11px] text-nomi-muted">/</kbd>
          </form>

          {open ? (
            <div className="absolute right-0 top-full mt-2 w-full overflow-hidden rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface-raised/95 p-1.5 shadow-[var(--nomi-shadow-float)] backdrop-blur-2xl">
              {results.length ? results.map((item) => (
                <button key={item.href} type="button" onClick={() => goTo(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-nomi-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nomi-purple-50 text-nomi-purple-600"><AppIcon icon={item.icon} size={17} /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold text-nomi-ink">{item.label}</span><span className="block truncate text-xs text-nomi-muted">{item.detail}</span></span>
                </button>
              )) : <p className="px-3 py-4 text-sm text-nomi-muted">No matching destination.</p>}
            </div>
          ) : null}
        </div>

        <Link href="/notifications" aria-label="Notifications" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-nomi-border bg-nomi-surface/75 text-nomi-muted shadow-sm transition-[background-color,color,transform] hover:bg-nomi-surface-raised hover:text-nomi-purple-700 active:scale-95">
          <AppIcon icon={Notification02Icon} size={20} />
        </Link>
        <AccountMenu name={account?.name ?? null} email={account?.email ?? null} direction="down" align="end" compact />
      </div>
    </header>
  );
}
