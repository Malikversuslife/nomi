import Link from "next/link";
import { BookOpen, Bot, ChartNoAxesColumnIncreasing, Home } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/nomi", label: "Nomi", icon: Bot },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
];

export function FoundationShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[calc(6rem+var(--nomi-safe-bottom))] pt-[calc(2rem+var(--nomi-safe-top))] sm:max-w-2xl lg:max-w-5xl lg:pb-10">
      {children}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 border-t border-nomi-border bg-nomi-surface/95 px-[max(1rem,var(--nomi-safe-left))] pb-[calc(0.75rem+var(--nomi-safe-bottom))] pt-3 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link className="flex min-h-11 flex-col items-center justify-center rounded-[var(--nomi-radius-pill)] px-2 text-xs font-semibold text-nomi-muted aria-current:bg-nomi-purple-100 aria-current:text-nomi-purple-700" href={item.href} aria-current={active === item.label ? "page" : undefined}>
                  <Icon aria-hidden="true" size={18} strokeWidth={2.4} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </main>
  );
}
