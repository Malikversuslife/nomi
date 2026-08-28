import Link from "next/link";
import {
  Atom02Icon,
  BookOpen01Icon,
  ChartNoAxesColumnIncreasingIcon,
  ChatBotIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { hasSupabaseConfig } from "@/server/env";
import { getAccountContext } from "@/server/profile/data";
import { AccountMenu } from "@/components/account/account-menu";
import { NomiMascot } from "@/components/nomi/nomi-mascot";
import { AppIcon } from "@/components/ui/app-icon";

type NavItem = { href: string; label: string; icon: IconSvgElement };

const desktopNavItems: NavItem[] = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/learn", label: "Learn", icon: BookOpen01Icon },
  { href: "/practice", label: "Practice", icon: Atom02Icon },
  { href: "/nomi", label: "Nomi", icon: ChatBotIcon },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasingIcon },
];

const mobileNavItems: NavItem[] = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/learn", label: "Learn", icon: BookOpen01Icon },
  { href: "/nomi", label: "Nomi", icon: ChatBotIcon },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasingIcon },
];

export async function FoundationShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[calc(5.5rem+var(--nomi-safe-bottom))] pt-[calc(1.5rem+var(--nomi-safe-top))] sm:max-w-2xl lg:max-w-5xl lg:pb-10">
        {children}
        <MobileNav active={active} />
      </main>
    );
  }

  const account = await getAccountContext();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[calc(5.5rem+var(--nomi-safe-bottom))] pt-[calc(4.5rem+var(--nomi-safe-top))] sm:max-w-2xl lg:max-w-5xl lg:px-8 lg:pb-6 lg:pl-72 lg:pr-8 lg:pt-[calc(1.5rem+var(--nomi-safe-top))]">
      {children}

      {/* Desktop sidebar: visible on lg+, hidden on mobile */}
      <aside
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 top-0 hidden h-full w-64 flex-col border-r border-nomi-border bg-nomi-surface px-4 pt-6 lg:flex"
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <NomiMascot state="neutral" size={32} />
          <h2 className="font-display text-lg font-bold tracking-[-0.03em] text-nomi-ink">Nomi</h2>
        </div>

        <nav className="flex-1 space-y-1">
          {desktopNavItems.map((item) => {
            const isActive = active === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-[var(--nomi-radius-medium)] px-3 py-2.5 text-sm transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-1
                  ${isActive
                    ? "bg-nomi-purple-100 font-semibold text-nomi-ink"
                    : "font-medium text-nomi-muted hover:bg-nomi-purple-50 hover:text-nomi-ink"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <AppIcon
                  icon={item.icon}
                  className={isActive ? "text-nomi-purple-600" : "text-nomi-muted"}
                  size={18}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-nomi-border pt-4">
          <AccountMenu
            name={account?.name ?? null}
            email={account?.email ?? null}
            direction="up"
            align="start"
          />
        </div>
      </aside>

      {/* Compact mobile header: visible under lg, hidden on desktop */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 border-b border-nomi-border bg-nomi-surface px-4 lg:hidden"
        style={{ paddingTop: "var(--nomi-safe-top)" }}
      >
        <div className="flex min-h-14 items-center gap-2.5">
          <NomiMascot state="neutral" size={28} />
          <h2 className="font-display text-base font-bold tracking-[-0.03em] text-nomi-ink">
            Nomi
          </h2>
        </div>
        <AccountMenu
          name={account?.name ?? null}
          email={account?.email ?? null}
          direction="down"
          align="end"
          compact
        />
      </header>

      <MobileNav active={active} />
    </main>
  );
}

function MobileNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-nomi-border bg-nomi-surface lg:hidden"
      style={{ paddingBottom: "var(--nomi-safe-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-4 pt-1.5 pb-1">
        {mobileNavItems.map((item) => {
          const isActive = active === item.label;

          return (
            <li key={item.href} className="flex-1">
              <Link
                className={`
                  flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[var(--nomi-radius-pill)] px-2 py-1.5
                  transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-1
                  ${isActive ? "bg-nomi-purple-100" : ""}
                `}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <AppIcon
                  icon={item.icon}
                  className={isActive ? "text-nomi-purple-600" : "text-nomi-muted"}
                  size={20}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                <span
                  className={`text-[10px] leading-tight ${isActive ? "font-semibold text-nomi-ink" : "font-medium text-nomi-muted"}`}
                >
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