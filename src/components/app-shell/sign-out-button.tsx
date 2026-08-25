import { signOutAction } from "@/server/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="min-h-11 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-4 text-sm font-semibold text-nomi-ink" type="submit">
        Sign out
      </button>
    </form>
  );
}
