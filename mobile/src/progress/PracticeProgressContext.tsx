import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

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

function clampRounded(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function calculateMastery(currentMastery: number, outcomes: boolean[], difficulty: number) {
  let mastery = clampRounded(currentMastery, 0, 100);
  const previousMastery = mastery;

  outcomes.forEach((isCorrect, index) => {
    const attemptsBefore = outcomes.slice(Math.max(0, index - 8), index);
    let recentAccuracy = 0;

    if (attemptsBefore.length > 0) {
      let weightedTotal = 0;
      let weightSum = 0;
      attemptsBefore.forEach((correct, attemptIndex) => {
        const weight = attemptIndex + 1;
        weightedTotal += (correct ? 1 : 0) * weight;
        weightSum += weight;
      });
      recentAccuracy = weightedTotal / weightSum;
    }

    const recencyWeight = 0.7 + ((index + 1) / outcomes.length) * 0.3;
    const correctnessSign = isCorrect ? 1 : -1.2;
    const difficultyWeight = 0.6 + difficulty / 10;
    const performanceWeight = recentAccuracy >= 0.8 ? 1.1 : recentAccuracy >= 0.5 ? 1 : 0.9;
    const easyRepeatWeight = isCorrect && difficulty <= 3 && mastery >= 70 ? 0.45 : 1;
    const mistakeProtectionWeight = !isCorrect && mastery >= 75 ? 0.6 : 1;
    const delta = correctnessSign * difficultyWeight * performanceWeight * easyRepeatWeight * mistakeProtectionWeight * recencyWeight * 4;

    mastery = clampRounded(mastery + delta, 0, 100);
  });

  return { mastery, delta: mastery - previousMastery };
}

export function PracticeProgressProvider({ children }: PropsWithChildren) {
  const [latestSession, setLatestSession] = useState<PracticeSessionSummary | null>(null);
  const [mastery, setMastery] = useState(PROTOTYPE_STARTING_MASTERY);

  const value = useMemo<PracticeProgressContextValue>(() => ({
    latestSession,
    mastery,
    recordSession: (session) => {
      const calculation = calculateMastery(mastery, session.outcomes, session.difficulty);
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
