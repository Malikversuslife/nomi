"use client";

import { useEffect, useState } from "react";
import { ComputerIcon, Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";

type ThemePreference = "light" | "dark" | "system";

const options = [
  { value: "light", label: "Light", icon: Sun02Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
  { value: "system", label: "System", icon: ComputerIcon },
] as const;

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  return preference === "system"
    ? typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : preference;
}

function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolveTheme(preference);
  document.documentElement.style.colorScheme = resolveTheme(preference);
}

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("nomi-theme");
    const initial: ThemePreference = saved === "light" || saved === "dark" ? saved : "system";
    const syncControl = window.setTimeout(() => setPreference(initial), 0);
    applyTheme(initial);

    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const syncSystemTheme = () => {
      if ((window.localStorage.getItem("nomi-theme") ?? "system") === "system") applyTheme("system");
    };
    media?.addEventListener("change", syncSystemTheme);
    return () => {
      window.clearTimeout(syncControl);
      media?.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  const choose = (next: ThemePreference) => {
    setPreference(next);
    if (next === "system") window.localStorage.removeItem("nomi-theme");
    else window.localStorage.setItem("nomi-theme", next);
    applyTheme(next);
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-nomi-ink">Colour theme</legend>
      <p className="mt-1 text-sm text-nomi-muted">Choose a theme or follow this device automatically.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--nomi-radius-large)] bg-nomi-surface-subtle p-1.5" aria-label="Colour theme">
        {options.map((option) => {
          const selected = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(option.value)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-[var(--nomi-radius-medium)] px-3 text-sm font-semibold transition-[background-color,color,box-shadow,transform] active:scale-[0.985] ${selected ? "bg-nomi-surface text-nomi-ink shadow-sm" : "text-nomi-muted hover:text-nomi-ink"}`}
            >
              <AppIcon icon={option.icon} size={18} />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
