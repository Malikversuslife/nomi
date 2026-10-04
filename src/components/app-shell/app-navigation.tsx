"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Atom02Icon,
  BookOpen01Icon,
  Cancel01Icon,
  ChartNoAxesColumnIncreasingIcon,
  ChatBotIcon,
  Home01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AccountMenu } from "@/components/account/account-menu";
import { NomiWordmark } from "@/components/nomi/nomi-wordmark";
import { AppIcon } from "@/components/ui/app-icon";

type NavItem = { href: string; label: string; icon: IconSvgElement };
type Account = { name: string | null; email: string | null } | null;

const navItems: NavItem[] = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/learn", label: "Learn", icon: BookOpen01Icon },
  { href: "/practice", label: "Practice", icon: Atom02Icon },
  { href: "/nomi", label: "Nomi", icon: ChatBotIcon },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasingIcon },
];

export function AppNavigation({ active, account }: { active: string; account: Account }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    for (const item of navItems) router.prefetch(item.href);
  }, [router]);


  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <aside aria-label="Main navigation" className="nomi-material fixed inset-y-0 left-0 z-40 hidden h-full w-64 flex-col border-r border-nomi-border-subtle px-4 pb-5 pt-6 lg:flex">
        <SidebarContents active={active} account={account} />
      </aside>
      <header className="nomi-material fixed inset-x-0 top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-nomi-border-subtle px-4 lg:hidden" style={{ paddingTop: "var(--nomi-safe-top)" }}>
        <button type="button" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-nomi-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600">
          <AppIcon icon={Menu01Icon} size={23} />
        </button>
        <Link href="/" aria-label="Nomi website"><NomiWordmark width={88} variant="purple" label="Nomi" /></Link>
        <AccountMenu name={account?.name ?? null} email={account?.email ?? null} direction="down" align="end" compact />
      </header>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside id="mobile-navigation" aria-label="Main navigation" className={`nomi-material absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-nomi-border-subtle px-4 pb-[calc(1rem+var(--nomi-safe-bottom))] pt-[calc(1rem+var(--nomi-safe-top))] shadow-[var(--nomi-shadow-float)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-6 flex items-center justify-between px-2">
            <Link href="/" aria-label="Nomi website" onClick={() => setOpen(false)}><NomiWordmark width={104} variant="purple" label="Nomi" /></Link>
            <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-nomi-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600">
              <AppIcon icon={Cancel01Icon} size={22} />
            </button>
          </div>
          <SidebarContents active={active} account={account} mobile onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}

function SidebarContents({ active, account, mobile = false, onNavigate }: { active: string; account: Account; mobile?: boolean; onNavigate?: () => void }) {
  return (
    <>
      {!mobile ? <div className="mb-8 px-2"><Link href="/" aria-label="Nomi website"><NomiWordmark width={112} variant="purple" label="Nomi" /></Link></div> : null}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = active === item.label;
          return (
            <Link key={item.href} href={item.href} prefetch onClick={onNavigate} className={`flex min-h-12 items-center gap-3 rounded-[var(--nomi-radius-medium)] px-3 py-2.5 text-[0.94rem] tracking-[-0.01em] transition-[background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-1 ${isActive ? "bg-nomi-purple-600 font-semibold text-white shadow-[0_8px_24px_rgb(108_60_255/0.18)]" : "font-medium text-nomi-muted hover:bg-nomi-surface-subtle hover:text-nomi-ink active:scale-[0.985]"}`} aria-current={isActive ? "page" : undefined}>
              <AppIcon icon={item.icon} className={isActive ? "text-white" : "text-nomi-muted"} size={19} strokeWidth={isActive ? 2 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-nomi-border pt-4">
        <AccountMenu name={account?.name ?? null} email={account?.email ?? null} direction="up" align="start" />
      </div>
    </>
  );
}
