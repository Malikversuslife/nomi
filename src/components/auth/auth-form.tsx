"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/server/auth/schemas";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

const initialState: AuthFormState = {};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="space-y-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 shadow-sm">
      {isSignUp ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-nomi-ink" htmlFor="displayName">
            Preferred name
          </label>
          <input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink placeholder:text-nomi-muted focus:border-nomi-purple-500 focus:outline-none" id="displayName" name="displayName" autoComplete="name" required />
          {state.fieldErrors?.displayName ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.displayName[0]}</p> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-nomi-ink" htmlFor="email">
          Email
        </label>
        <input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink placeholder:text-nomi-muted focus:border-nomi-purple-500 focus:outline-none" id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-nomi-ink" htmlFor="password">
          Password
        </label>
        <input className="min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink placeholder:text-nomi-muted focus:border-nomi-purple-500 focus:outline-none" id="password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required />
        {state.fieldErrors?.password ? <p className="text-sm text-nomi-error-500">{state.fieldErrors.password[0]}</p> : null}
      </div>

      {state.message ? <p className="rounded-[var(--nomi-radius-medium)] bg-nomi-warning-100 px-4 py-3 text-sm text-nomi-warning-700">{state.message}</p> : null}

      <button className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white shadow-sm transition-colors hover:bg-nomi-purple-700 disabled:cursor-not-allowed disabled:bg-nomi-disabled-bg disabled:text-nomi-disabled-text" type="submit" disabled={pending}>
        {pending ? "Working..." : isSignUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-sm text-nomi-muted">
        {isSignUp ? "Already have an account? " : "New to Nomi? "}
        <Link className="font-semibold text-nomi-purple-700" href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
