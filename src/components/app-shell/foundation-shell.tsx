import Link from "next/link";
import { hasSupabaseConfig } from "@/server/env";
import { SignOutButton } from "@/components/app-shell/sign-out-button";
import { NomiMascot } from "@/components/nomi/nomi-mascot";

import { Home, BookOpen, Bot, ChartNoAxesColumnIncreasing, Atom } from "lucide-react";

const desktopNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Atom },
  { href: "/nomi", label: "Nomi", icon: Bot },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
];

const mobileNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/nomi", label: "Nomi", icon: Bot },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
];

export function FoundationShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[calc(4.5rem+var(--nomi-safe-bottom))] pt-[calc(1.5rem+var(--nomi-safe-top))] sm:max-w-2xl lg:max-w-5xl lg:pb-10">
        {children}
        <MobileNav active={active} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[calc(4.5rem+var(--nomi-safe-bottom))] pt-[calc(1.5rem+var(--nomi-safe-top))] sm:max-w-2xl lg:max-w-5xl lg:px-8 lg:pb-6 lg:pl-72 lg:pr-8">
      {children}

      {/* Desktop sidebar: visible on lg+, hidden on mobile */}
      <aside
        aria-label="Main navigation"
        className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 top-0 h-full w-64 border-r border-nomi-border bg-nomi-surface/95 px-4 pt-6"
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <NomiMascot state="neutral" size={32} />
          <h2 className="font-display text-lg font-bold tracking-[-0.03em] text-nomi-ink">Nomi</h2>
        </div>

        <nav className="flex-1 space-y-0.5">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-[var(--nomi-radius-medium)] px-3 py-2.5 text-sm font-medium transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500
                  ${isActive
                    ? "bg-nomi-purple-100/80 text-nomi-purple-700 font-semibold"
                    : "text-nomi-muted hover:bg-nomi-purple-50 hover:text-nomi-ink"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-nomi-border pt-4">
          <SignOutButton />
        </div>
      </aside>

      <MobileNav active={active} />
    </main>
  );
}

function MobileNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-nomi-border bg-nomi-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--nomi-safe-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-4 pt-1.5 pb-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;

          return (
            <li key={item.href} className="flex-1">
              <Link
                className={`
                  flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[var(--nomi-radius-pill)] px-2 py-1.5
                  transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500
                  ${isActive
                    ? "bg-nomi-purple-100 text-nomi-purple-700"
                    : "text-nomi-muted"
                  }
                `}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={isActive ? 2.6 : 2} />
                <span className={`text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
