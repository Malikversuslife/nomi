import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { supabase } from "@/lib/supabase";

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

type MasterySource = "prototype" | "supabase" | "new-learner";

type PracticeProgressContextValue = {
  latestSession: PracticeSessionSummary | null;
  mastery: number;
  masterySource: MasterySource;
  syncing: boolean;
  syncError: string | null;
  recordSession: (session: RecordSessionInput) => Promise<void>;
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
  const { user } = useLearnerSession();
  const [latestSession, setLatestSession] = useState<PracticeSessionSummary | null>(null);
  const [mastery, setMastery] = useState(PROTOTYPE_STARTING_MASTERY);
  const [masterySource, setMasterySource] = useState<MasterySource>("prototype");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) {
      setMastery(PROTOTYPE_STARTING_MASTERY);
      setMasterySource("prototype");
      setSyncError(null);
      setSyncing(false);
      return;
    }

    let mounted = true;
    setSyncing(true);
    setSyncError(null);

    async function hydrateMastery() {
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("slug", "factorisation")
        .maybeSingle();

      if (!mounted) return;
      if (topicError) {
        setSyncError("Could not load the Factorisation topic.");
        setSyncing(false);
        return;
      }
      if (!topic) {
        setSyncError("Factorisation is not available in the synced curriculum yet.");
        setSyncing(false);
        return;
      }

      const { data: progress, error: progressError } = await supabase
        .from("topic_progress")
        .select("mastery")
        .eq("user_id", user.id)
        .eq("topic_id", topic.id)
        .maybeSingle();

      if (!mounted) return;
      if (progressError) {
        setSyncError("Could not load your learner progress.");
        setSyncing(false);
        return;
      }

      if (progress) {
        setMastery(clampRounded(Number(progress.mastery), 0, 100));
        setMasterySource("supabase");
      } else {
        setMastery(0);
        setMasterySource("new-learner");
      }
      setSyncing(false);
    }

    void hydrateMastery();
    return () => { mounted = false; };
  }, [user]);

  const value = useMemo<PracticeProgressContextValue>(() => ({
    latestSession,
    mastery,
    masterySource,
    syncing,
    syncError,
    recordSession: async (session) => {
      const calculation = calculateMastery(mastery, session.outcomes, session.difficulty);
      const score = session.outcomes.filter(Boolean).length;
      const total = session.outcomes.length;
      const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
      const completedAt = new Date().toISOString();

      setMastery(calculation.mastery);
      setLatestSession({
        topic: session.topic,
        subject: session.subject,
        score,
        total,
        accuracy,
        mastery: calculation.mastery,
        masteryChange: calculation.delta,
        completedAt,
      });

      if (!user || !supabase) return;

      setSyncing(true);
      setSyncError(null);

      try {
        const { data: subject, error: subjectError } = await supabase
          .from("subjects")
          .select("id")
          .eq("slug", "mathematics")
          .single();
        if (subjectError || !subject) throw new Error("subject");

        const { data: topic, error: topicError } = await supabase
          .from("topics")
          .select("id")
          .eq("slug", "factorisation")
          .eq("subject_id", subject.id)
          .maybeSingle();
        if (topicError || !topic) throw new Error("topic");

        const { data: learnerSubject, error: learnerSubjectError } = await supabase
          .from("learner_subjects")
          .upsert(
            { user_id: user.id, subject_id: subject.id, status: "active" },
            { onConflict: "user_id,subject_id" },
          )
          .select("id")
          .single();
        if (learnerSubjectError || !learnerSubject) throw new Error("learner-subject");

        const { data: existingProgress, error: existingProgressError } = await supabase
          .from("topic_progress")
          .select("id,attempted_count,correct_count")
          .eq("user_id", user.id)
          .eq("topic_id", topic.id)
          .maybeSingle();
        if (existingProgressError) throw new Error("progress-read");

        const attemptedCount = (existingProgress?.attempted_count ?? 0) + total;
        const correctCount = (existingProgress?.correct_count ?? 0) + score;
        const recentAccuracy = accuracy;

        const { error: progressWriteError } = await supabase
          .from("topic_progress")
          .upsert(
            {
              user_id: user.id,
              learner_subject_id: learnerSubject.id,
              topic_id: topic.id,
              mastery: calculation.mastery,
              recent_accuracy: recentAccuracy,
              difficulty: session.difficulty,
              attempted_count: attemptedCount,
              correct_count: correctCount,
              last_practiced_at: completedAt,
            },
            { onConflict: "user_id,topic_id" },
          );
        if (progressWriteError) throw new Error("progress-write");

        setMasterySource("supabase");
      } catch {
        setSyncError("Practice finished locally, but Nomi could not save this progress to Supabase yet.");
      } finally {
        setSyncing(false);
      }
    },
  }), [latestSession, mastery, masterySource, syncing, syncError, user]);

  return <PracticeProgressContext.Provider value={value}>{children}</PracticeProgressContext.Provider>;
}

export function usePracticeProgress() {
  const context = useContext(PracticeProgressContext);
  if (!context) throw new Error("usePracticeProgress must be used within PracticeProgressProvider");
  return context;
}
