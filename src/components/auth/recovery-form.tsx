"use client";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/server/auth/schemas";
const initialState: AuthFormState = {};
export function RecoveryForm({ action }: { action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState> }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-4">
    <div className="space-y-2"><label className="text-sm font-semibold text-nomi-ink" htmlFor="email">Email</label><input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink focus:border-nomi-purple-500 focus:outline-none" id="email" name="email" type="email" autoComplete="email" required />{state.fieldErrors?.email ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.email[0]}</p> : null}</div>
    {state.message ? <p role="status" className="rounded-[var(--nomi-radius-medium)] bg-nomi-purple-50 px-4 py-3 text-sm text-nomi-ink">{state.message}</p> : null}
    <button className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-nomi-on-primary disabled:opacity-50" type="submit" disabled={pending}>{pending ? "Sending…" : "Send recovery link"}</button>
    <p className="text-center text-sm"><Link className="font-semibold text-nomi-purple-700" href="/auth/sign-in">Back to sign in</Link></p>
  </form>;
}
