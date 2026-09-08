import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase, supabaseConfigured } from "@/lib/supabase";

type LearnerSessionContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  displayName: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const LearnerSessionContext = createContext<LearnerSessionContextValue | null>(null);

export function LearnerSessionProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function hydrate(nextUser: User | null) {
      if (!mounted) return;
      setUser(nextUser);
      setDisplayName(null);
      if (!nextUser) return;

      const { data } = await supabase.from("profiles").select("display_name").eq("id", nextUser.id).maybeSingle();
      if (mounted) setDisplayName(data?.display_name ?? null);
    }

    supabase.auth.getSession().then(async ({ data }) => {
      await hydrate(data.session?.user ?? null);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user ?? null);
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
    error,
    signIn: async (email, password) => {
      if (!supabase) {
        setError("Supabase is not configured for the mobile app yet.");
        return false;
      }
      setError(null);
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return false;
      }
      return true;
    },
    signOut: async () => {
      if (!supabase) return;
      setError(null);
      await supabase.auth.signOut();
    },
  }), [displayName, error, loading, user]);

  return <LearnerSessionContext.Provider value={value}>{children}</LearnerSessionContext.Provider>;
}

export function useLearnerSession() {
  const context = useContext(LearnerSessionContext);
  if (!context) throw new Error("useLearnerSession must be used within LearnerSessionProvider");
  return context;
}
