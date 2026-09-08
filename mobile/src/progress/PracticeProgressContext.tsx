import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

export type PracticeSessionSummary = {
  topic: string;
  subject: string;
  score: number;
  total: number;
  accuracy: number;
  completedAt: string;
};

type PracticeProgressContextValue = {
  latestSession: PracticeSessionSummary | null;
  recordSession: (session: Omit<PracticeSessionSummary, "accuracy" | "completedAt">) => void;
};

const PracticeProgressContext = createContext<PracticeProgressContextValue | null>(null);

export function PracticeProgressProvider({ children }: PropsWithChildren) {
  const [latestSession, setLatestSession] = useState<PracticeSessionSummary | null>(null);

  const value = useMemo<PracticeProgressContextValue>(() => ({
    latestSession,
    recordSession: (session) => {
      const accuracy = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
      setLatestSession({
        ...session,
        accuracy,
        completedAt: new Date().toISOString(),
      });
    },
  }), [latestSession]);

  return <PracticeProgressContext.Provider value={value}>{children}</PracticeProgressContext.Provider>;
}

export function usePracticeProgress() {
  const context = useContext(PracticeProgressContext);
  if (!context) {
    throw new Error("usePracticeProgress must be used within PracticeProgressProvider");
  }
  return context;
}
