import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase, supabaseConfigured } from "@/lib/supabase";

type LearnerSessionContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  displayName: string | null;
  onboardingCompleted: boolean | null;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ ok: boolean; needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const LearnerSessionContext = createContext<LearnerSessionContextValue | null>(null);

export function LearnerSessionProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function hydrate(nextUser: User | null) {
    setLoading(true);
    setUser(nextUser);
    setDisplayName(null);
    setOnboardingCompleted(nextUser ? null : false);

    if (!nextUser || !supabase) {
      setLoading(false);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("display_name,onboarding_completed_at")
      .eq("id", nextUser.id)
      .maybeSingle();

    if (profileError) setError(profileError.message);
    setDisplayName(data?.display_name ?? null);
    setOnboardingCompleted(Boolean(data?.onboarding_completed_at));
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) void hydrate(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) void hydrate(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<LearnerSessionContextValue>(() => ({
    configured: supabaseConfigured,
    loading,
    user,
    displayName,
    onboardingCompleted,
    error,
    refreshProfile: async () => {
      if (user) await hydrate(user);
    },
    signIn: async (email, password) => {
      if (!supabase) {
        setError("Supabase is not configured for the mobile app yet.");
        return false;
      }
      setError(null);
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return false;
      }
      await hydrate(data.user);
      return true;
    },
    signUp: async (email, password, name) => {
      if (!supabase) {
        setError("Supabase is not configured for the mobile app yet.");
        return { ok: false, needsEmailConfirmation: false };
      }
      setError(null);
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() } },
      });
      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return { ok: false, needsEmailConfirmation: false };
      }
      if (data.user && data.session) await hydrate(data.user);
      else setLoading(false);
      return { ok: true, needsEmailConfirmation: !data.session };
    },
    resetPassword: async (email) => {
      if (!supabase) {
        setError("Supabase is not configured for the mobile app yet.");
        return false;
      }
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) {
        setError(resetError.message);
        return false;
      }
      return true;
    },
    signOut: async () => {
      if (!supabase) return;
      setError(null);
      await supabase.auth.signOut();
      setUser(null);
      setDisplayName(null);
      setOnboardingCompleted(false);
    },
  }), [displayName, error, loading, onboardingCompleted, user]);

  return <LearnerSessionContext.Provider value={value}>{children}</LearnerSessionContext.Provider>;
}

export function useLearnerSession() {
  const context = useContext(LearnerSessionContext);
  if (!context) throw new Error("useLearnerSession must be used within LearnerSessionProvider");
  return context;
}
