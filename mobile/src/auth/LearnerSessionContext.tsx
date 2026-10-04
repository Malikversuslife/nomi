import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";

import { supabase, supabaseConfigured } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type LearnerSessionContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  displayName: string | null;
  error: string | null;
  notice: string | null;
  clearMessage: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const LearnerSessionContext = createContext<LearnerSessionContextValue | null>(null);
const googleRedirect = "nomi://auth";

function getOAuthTokens(url: string) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.hash.slice(1));
  const query = parsed.searchParams;
  const error = params.get("error_description") ?? query.get("error_description") ?? params.get("error") ?? query.get("error");
  if (error) throw new Error(error);
  const access_token = params.get("access_token") ?? query.get("access_token");
  const refresh_token = params.get("refresh_token") ?? query.get("refresh_token");
  if (!access_token || !refresh_token) throw new Error("Google did not return a Nomi session. Please try again.");
  return { access_token, refresh_token };
}

export function LearnerSessionProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const client = supabase;
    let mounted = true;

    async function hydrate(nextUser: User | null) {
      if (!mounted) return;
      setUser(nextUser);
      setDisplayName(null);
      if (!nextUser) return;
      const { data } = await client.from("profiles").select("display_name").eq("id", nextUser.id).maybeSingle();
      if (mounted) setDisplayName(data?.display_name ?? nextUser.user_metadata?.full_name ?? nextUser.user_metadata?.display_name ?? null);
    }

    client.auth.getSession().then(async ({ data, error: sessionError }) => {
      await hydrate(data.session?.user ?? null);
      if (mounted) {
        if (sessionError) setError(sessionError.message);
        setLoading(false);
      }
    }).catch((cause) => {
      if (mounted) { setError(cause instanceof Error ? cause.message : "Could not restore your session."); setLoading(false); }
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user ?? null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<LearnerSessionContextValue>(() => ({
    configured: supabaseConfigured,
    loading,
    user,
    displayName,
    error,
    notice,
    clearMessage: () => { setError(null); setNotice(null); },
    signIn: async (email, password) => {
      if (!supabase) { setError("Nomi sign-in is not configured yet."); return false; }
      setError(null); setNotice(null); setLoading(true);
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not sign in.");
        return false;
      } finally { setLoading(false); }
    },
    signUp: async (name, email, password) => {
      if (!supabase) { setError("Nomi sign-up is not configured yet."); return false; }
      setError(null); setNotice(null); setLoading(true);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password, options: { data: { display_name: name } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) setNotice("Check your email to confirm your account, then sign in.");
        return Boolean(data.session);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not create your account.");
        return false;
      } finally { setLoading(false); }
    },
    signInWithGoogle: async () => {
      if (!supabase) { setError("Nomi sign-in is not configured yet."); return false; }
      setError(null); setNotice(null); setLoading(true);
      try {
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: googleRedirect, skipBrowserRedirect: true },
        });
        if (oauthError) throw oauthError;
        if (!data.url) throw new Error("Google sign-in could not be started.");
        const result = await WebBrowser.openAuthSessionAsync(data.url, googleRedirect);
        if (result.type !== "success") return false;
        const { error: sessionError } = await supabase.auth.setSession(getOAuthTokens(result.url));
        if (sessionError) throw sessionError;
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
        return false;
      } finally { setLoading(false); }
    },
    signOut: async () => {
      if (!supabase) return;
      setError(null); setNotice(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
    },
  }), [displayName, error, loading, notice, user]);

  return <LearnerSessionContext.Provider value={value}>{children}</LearnerSessionContext.Provider>;
}

export function useLearnerSession() {
  const context = useContext(LearnerSessionContext);
  if (!context) throw new Error("useLearnerSession must be used within LearnerSessionProvider");
  return context;
}
