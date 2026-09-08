import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { calculateMastery } from "../../../shared/adaptive/mastery";

export type PracticeSessionSummary = {
  topic: string;
  subject: string;
  score: number;
  total: number;
  accuracy: number;
  mastery: number;
  masteryChange: number;
  completedAt: string;
};

type RecordSessionInput = {
  topic: string;
  subject: string;
  outcomes: boolean[];
  difficulty: number;
};

type PracticeProgressContextValue = {
  latestSession: PracticeSessionSummary | null;
  mastery: number;
  recordSession: (session: RecordSessionInput) => void;
};

const PracticeProgressContext = createContext<PracticeProgressContextValue | null>(null);

const PROTOTYPE_STARTING_MASTERY = 64;

export function PracticeProgressProvider({ children }: PropsWithChildren) {
  const [latestSession, setLatestSession] = useState<PracticeSessionSummary | null>(null);
  const [mastery, setMastery] = useState(PROTOTYPE_STARTING_MASTERY);

  const value = useMemo<PracticeProgressContextValue>(() => ({
    latestSession,
    mastery,
    recordSession: (session) => {
      const attempts = session.outcomes.map((isCorrect) => ({
        isCorrect,
        difficulty: session.difficulty,
      }));
      const calculation = calculateMastery(mastery, attempts);
      const score = session.outcomes.filter(Boolean).length;
      const total = session.outcomes.length;
      const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

      setMastery(calculation.mastery);
      setLatestSession({
        topic: session.topic,
        subject: session.subject,
        score,
        total,
        accuracy,
        mastery: calculation.mastery,
        masteryChange: calculation.delta,
        completedAt: new Date().toISOString(),
      });
    },
  }), [latestSession, mastery]);

  return <PracticeProgressContext.Provider value={value}>{children}</PracticeProgressContext.Provider>;
}

export function usePracticeProgress() {
  const context = useContext(PracticeProgressContext);
  if (!context) {
    throw new Error("usePracticeProgress must be used within PracticeProgressProvider");
  }
  return context;
}
