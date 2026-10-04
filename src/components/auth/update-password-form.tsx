"use client";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/server/auth/schemas";
const initialState: AuthFormState = {};
export function UpdatePasswordForm({ action }: { action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState> }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-4">
    <div className="space-y-2"><label className="text-sm font-semibold text-nomi-ink" htmlFor="password">New password</label><input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink focus:border-nomi-purple-500 focus:outline-none" id="password" name="password" type="password" autoComplete="new-password" required />{state.fieldErrors?.password ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.password[0]}</p> : null}</div>
    <div className="space-y-2"><label className="text-sm font-semibold text-nomi-ink" htmlFor="confirmPassword">Confirm new password</label><input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink focus:border-nomi-purple-500 focus:outline-none" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />{state.fieldErrors?.confirmPassword ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.confirmPassword[0]}</p> : null}</div>
    {state.message ? <p role="alert" className="rounded-[var(--nomi-radius-medium)] bg-nomi-warning-100 px-4 py-3 text-sm text-nomi-warning-700">{state.message}</p> : null}
    <button className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-nomi-on-primary disabled:opacity-50" type="submit" disabled={pending}>{pending ? "Updating…" : "Set new password"}</button>
    <p className="text-center text-sm"><Link className="font-semibold text-nomi-purple-700" href="/auth/forgot-password">Request another link</Link></p>
  </form>;
}
