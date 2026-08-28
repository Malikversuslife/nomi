"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  Logout01Icon,
  Notification02Icon,
  ProfileIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { signOutAction } from "@/server/auth/actions";
import { AppIcon } from "@/components/ui/app-icon";

type MenuItem = { href: string; label: string; icon: IconSvgElement };

const menuItems: MenuItem[] = [
  { href: "/profile", label: "Profile", icon: ProfileIcon },
  { href: "/notifications", label: "Notifications", icon: Notification02Icon },
  { href: "/settings", label: "Settings", icon: Settings01Icon },
];

const itemClasses =
  "flex w-full items-center gap-2.5 rounded-[var(--nomi-radius-medium)] px-3 py-2 text-sm font-medium text-nomi-ink transition-colors duration-150 hover:bg-nomi-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-1";

export function AccountMenu({
  name,
  email,
  direction = "down",
  align = "start",
  compact = false,
  className,
}: {
  name: string | null;
  email: string | null;
  direction?: "up" | "down";
  align?: "start" | "end";
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerId = `account-trigger-${id}`;
  const menuId = `account-menu-${id}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial =
    name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : "N";

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      );
      first?.focus();
    }
  }, [open]);

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    );

    if (items.length === 0) {
      return;
    }

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      nextIndex =
        currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <div className={`relative ${className ?? ""}`} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={name ? `Account menu for ${name}` : "Account menu"}
        onClick={() => setOpen((value) => !value)}
        className={`
          rounded-[var(--nomi-radius-pill)] transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 focus-visible:ring-offset-1
          ${compact
            ? "flex h-11 w-11 items-center justify-center hover:bg-nomi-purple-50"
            : "flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left hover:bg-nomi-purple-50"
          }
        `}
      >
        <span
          className={`
            flex shrink-0 items-center justify-center bg-nomi-purple-100 font-bold text-nomi-purple-700
            ${compact ? "h-9 w-9 rounded-full text-sm" : "h-9 w-9 rounded-xl text-sm"}
          `}
        >
          {initial}
        </span>

        {!compact ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-nomi-ink">
                {name ?? "Account"}
              </span>
              {email ? (
                <span className="block truncate text-xs text-nomi-muted">
                  {email}
                </span>
              ) : null}
            </span>
            <AppIcon
              icon={ChevronDownIcon}
              size={16}
              strokeWidth={2}
              className={`shrink-0 text-nomi-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className={`
            absolute z-50 w-56 rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface p-1.5 shadow-lg
            ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"} 
            ${align === "end" ? "right-0" : "left-0"}
          `}
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              tabIndex={-1}
              onClick={close}
              className={itemClasses}
            >
              <AppIcon
                icon={item.icon}
                size={18}
                strokeWidth={1.75}
                className="shrink-0 text-nomi-muted"
              />
              {item.label}
            </Link>
          ))}

          <div role="separator" className="my-1.5 h-px bg-nomi-border" />

          <form action={signOutAction}>
            <button role="menuitem" tabIndex={-1} type="submit" className={itemClasses}>
              <AppIcon
                icon={Logout01Icon}
                size={18}
                strokeWidth={1.75}
                className="shrink-0 text-nomi-muted"
              />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}