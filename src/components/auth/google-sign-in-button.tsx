"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/server/supabase/browser";

export function GoogleSignInButton({ nextPath }: { nextPath?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startGoogleSignIn() {
    setPending(true);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const callback = new URL("/auth/callback", window.location.origin);
      if (nextPath) callback.searchParams.set("next", nextPath);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (oauthError) throw oauthError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in could not start.");
      setPending(false);
    }
  }

  return <div className="space-y-2">
    <div className="flex items-center gap-3 py-2 text-xs font-semibold text-nomi-muted"><span className="h-px flex-1 bg-nomi-border"/>OR<span className="h-px flex-1 bg-nomi-border"/></div>
    <button type="button" onClick={() => void startGoogleSignIn()} disabled={pending} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--nomi-radius-pill)] border border-nomi-border bg-nomi-surface px-5 font-semibold text-nomi-ink transition-colors hover:bg-nomi-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-600 disabled:cursor-not-allowed disabled:opacity-50">
      <span aria-hidden className="text-xl font-bold text-[#4285F4]">G</span>{pending ? "Opening Google…" : "Continue with Google"}
    </button>
    {error ? <p role="alert" className="text-sm text-nomi-error-500">{error}</p> : null}
  </div>;
}
