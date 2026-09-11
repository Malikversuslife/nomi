import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

export type PracticeAttemptInput = {
  prompt: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  questionType?: "multiple_choice" | "short_answer";
  conceptName?: string;
  misconceptionKey?: string | null;
  misconceptionCategory?: string | null;
};

export type AdaptivePracticeState = {
  difficulty: number;
  intervention: "reinforce" | "standard_practice" | "challenge" | "worked_example";
  message: string;
};

export type MisconceptionSummary = {
  category: string;
  status: "active" | "recurring" | "improving" | "resolved";
  occurrenceCount: number;
  message: string;
};

type RecordSessionInput = {
  topic: string;
  topicId?: string;
  subject: string;
  subjectId?: string;
  outcomes: boolean[];
  attempts: PracticeAttemptInput[];
  difficulty: number;
};

type MasterySource = "prototype" | "supabase" | "new-learner";

type PracticeProgressContextValue = {
  latestSession: PracticeSessionSummary | null;
  mastery: number;
  masterySource: MasterySource;
  adaptivePractice: AdaptivePracticeState;
  misconception: MisconceptionSummary | null;
  activeTopicId: string | null;
  activeTopicName: string | null;
  syncing: boolean;
  syncError: string | null;
  setActiveTopic: (topicId: string | null, topicName?: string | null) => void;
  recordSession: (session: RecordSessionInput) => Promise<void>;
};

type MisconceptionEvidenceGroup = {
  key: string;
  category: string;
  count: number;
  occurrenceCount: number;
  status: "active" | "recurring";
};

const PracticeProgressContext = createContext<PracticeProgressContextValue | null>(null);
const PROTOTYPE_STARTING_MASTERY = 64;

function defaultAdaptiveState(topicName?: string | null): AdaptivePracticeState {
  return {
    difficulty: 3,
    intervention: "standard_practice",
    message: `Nomi is starting with a balanced ${topicName ?? "practice"} set while gathering evidence.`,
  };
}

function clampRounded(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function calculateMastery(currentMastery: number, outcomes: boolean[], difficulty: number) {
  let mastery = clampRounded(currentMastery, 0, 100);
  const previousMastery = mastery;

  outcomes.forEach((isCorrect, index) => {
    const attemptsBefore = outcomes.slice(Math.max(0, index - 8), index);
    let recentAccuracy = 0;

    if (attemptsBefore.length) {
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
    const delta =
      (isCorrect ? 1 : -1.2) *
      (0.6 + difficulty / 10) *
      (recentAccuracy >= 0.8 ? 1.1 : recentAccuracy >= 0.5 ? 1 : 0.9) *
      (isCorrect && difficulty <= 3 && mastery >= 70 ? 0.45 : 1) *
      (!isCorrect && mastery >= 75 ? 0.6 : 1) *
      recencyWeight *
      4;

    mastery = clampRounded(mastery + delta, 0, 100);
  });

  return { mastery, delta: mastery - previousMastery };
}

function deriveAdaptiveState(
  outcomes: boolean[],
  currentDifficulty: number,
  recurring = false,
  topicName?: string | null,
): AdaptivePracticeState {
  if (recurring) {
    return {
      difficulty: Math.max(1, currentDifficulty - 1),
      intervention: "worked_example",
      message: "Nomi has seen the same misconception more than once. The next set will slow down and use a worked-example approach.",
    };
  }

  if (!outcomes.length) return defaultAdaptiveState(topicName);

  const recent = outcomes.slice(-5);
  const accuracy = recent.filter(Boolean).length / recent.length;
  const trailingIncorrect = recent.length >= 2 && recent.slice(-2).every((value) => !value);
  const trailingCorrect = recent.length >= 3 && recent.slice(-3).every(Boolean);

  if (accuracy <= 0.4 || trailingIncorrect) {
    return {
      difficulty: Math.max(1, currentDifficulty - 1),
      intervention: "reinforce",
      message: "Nomi noticed repeated misses, so the next set will reinforce the current concept with gentler questions.",
    };
  }

  if (accuracy >= 0.8 && trailingCorrect) {
    return {
      difficulty: Math.min(10, currentDifficulty + 1),
      intervention: "challenge",
      message: "Nomi noticed strong recent accuracy, so the next set will increase the challenge.",
    };
  }

  return {
    difficulty: currentDifficulty,
    intervention: "standard_practice",
    message: "Nomi will keep the current difficulty while gathering more evidence.",
  };
}

function persistenceIntervention(intervention: AdaptivePracticeState["intervention"]) {
  if (intervention === "worked_example") return "worked-example";
  if (intervention === "standard_practice") return "continue";
  if (intervention === "challenge") return "increase-challenge";
  return intervention;
}

function humanizeMisconception(key: string) {
  const labels: Record<string, string> = {
    "factor-pair-selection": "factor-pair selection",
    "sign-error-factorisation": "sign pattern",
    "coefficient-factorisation": "leading coefficient",
    "square-adjustment": "square adjustment",
    "half-linear-coefficient": "halving the linear coefficient",
    "sign-square-completion": "sign pattern while completing the square",
    "square-root-plus-minus": "plus/minus square-root step",
    "fractional-square-adjustment": "fractional square adjustment",
    "coefficient-identification": "coefficient identification",
    "formula-substitution": "quadratic-formula substitution",
    "discriminant-sign": "discriminant sign",
    "denominator-formula": "quadratic-formula denominator",
    "discriminant-interpretation": "discriminant interpretation",
  };

  return labels[key] ?? key.replace(/-/g, " ");
}

function misconceptionMessage(
  key: string,
  status: MisconceptionSummary["status"],
  intervention?: AdaptivePracticeState["intervention"],
) {
  const label = humanizeMisconception(key);

  if (status === "recurring") {
    return `Nomi has seen the ${label} misunderstanding recur, so the next practice will target it directly.`;
  }

  if (status === "improving") {
    return `The earlier ${label} pattern is improving based on your latest assessed answers.`;
  }

  if (intervention === "challenge") {
    return `Your recent accuracy is strong. Nomi is still keeping an eye on one ${label} miss.`;
  }

  return `Nomi noticed a possible ${label} misconception and is watching for a pattern.`;
}

function supabaseError(stage: string, error: unknown) {
  const candidate = error as { message?: string; code?: string; details?: string; hint?: string } | null;
  const parts = [
    candidate?.message,
    candidate?.code && `code ${candidate.code}`,
    candidate?.details,
    candidate?.hint,
  ].filter(Boolean);
  return new Error(`${stage}: ${parts.length ? parts.join(" | ") : "unknown Supabase error"}`);
}

export function PracticeProgressProvider({ children }: PropsWithChildren) {
  const { user } = useLearnerSession();
  const [latestSession, setLatestSession] = useState<PracticeSessionSummary | null>(null);
  const [mastery, setMastery] = useState(PROTOTYPE_STARTING_MASTERY);
  const [masterySource, setMasterySource] = useState<MasterySource>("prototype");
  const [adaptivePractice, setAdaptivePractice] = useState<AdaptivePracticeState>(defaultAdaptiveState());
  const [misconception, setMisconception] = useState<MisconceptionSummary | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const activeTopicIdRef = useRef<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const setActiveTopic = useCallback(
    (topicId: string | null, topicName?: string | null) => {
      const changed = activeTopicIdRef.current !== topicId;
      activeTopicIdRef.current = topicId;
      setActiveTopicId(topicId);
      setActiveTopicName(topicName ?? null);

      if (changed) {
        setMastery(user ? 0 : PROTOTYPE_STARTING_MASTERY);
        setMasterySource(user ? "new-learner" : "prototype");
        setAdaptivePractice(defaultAdaptiveState(topicName));
        setMisconception(null);
        setSyncError(null);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user || !supabase) {
      setMastery(PROTOTYPE_STARTING_MASTERY);
      setMasterySource("prototype");
      setAdaptivePractice(defaultAdaptiveState(activeTopicName));
      setMisconception(null);
      setSyncError(null);
      setSyncing(false);
      return;
    }

    let mounted = true;
    setSyncing(true);
    setSyncError(null);

    async function hydrate() {
      let topicId = activeTopicId;
      let topicName = activeTopicName;

      if (!topicId) {
        const { data: fallbackTopic, error: topicError } = await supabase!
          .from("topics")
          .select("id,name")
          .eq("slug", "factorisation")
          .maybeSingle();

        if (!mounted) return;
        if (topicError || !fallbackTopic) {
          setSyncError("Could not load the current practice topic.");
          setSyncing(false);
          return;
        }

        topicId = fallbackTopic.id;
        topicName = fallbackTopic.name;
      }

      const { data: progress, error: progressError } = await supabase!
        .from("topic_progress")
        .select("id,mastery,difficulty")
        .eq("user_id", user!.id)
        .eq("topic_id", topicId)
        .maybeSingle();

      if (!mounted) return;
      if (progressError) {
        setSyncError("Could not load your learner progress.");
        setSyncing(false);
        return;
      }

      if (!progress) {
        setMastery(0);
        setMasterySource("new-learner");
        setAdaptivePractice(defaultAdaptiveState(topicName));
        setMisconception(null);
        setSyncing(false);
        return;
      }

      setMastery(clampRounded(Number(progress.mastery), 0, 100));
      setMasterySource("supabase");

      const [{ data: recentAttempts }, { data: misconceptions }] = await Promise.all([
        supabase!
          .from("practice_attempts")
          .select("is_correct")
          .eq("user_id", user!.id)
          .eq("topic_id", topicId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase!
          .from("misconception_state")
          .select("concept_name,category,status,occurrence_count")
          .eq("user_id", user!.id)
          .eq("topic_id", topicId)
          .neq("status", "resolved")
          .order("last_seen_at", { ascending: false })
          .limit(1),
      ]);

      if (!mounted) return;

      const active = misconceptions?.[0];
      const outcomes = (recentAttempts ?? []).map((attempt) => Boolean(attempt.is_correct)).reverse();
      const nextAdaptive = deriveAdaptiveState(
        outcomes,
        Number(progress.difficulty) || 3,
        active?.status === "recurring",
        topicName,
      );

      setAdaptivePractice(nextAdaptive);

      if (active) {
        setMisconception({
          category: active.category,
          status: active.status,
          occurrenceCount: active.occurrence_count,
          message: misconceptionMessage(active.concept_name, active.status, nextAdaptive.intervention),
        });
      } else {
        setMisconception(null);
      }

      setSyncing(false);
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [activeTopicId, activeTopicName, user]);

  const recordSession = useCallback(
    async (session: RecordSessionInput) => {
      const score = session.outcomes.filter(Boolean).length;
      const total = session.outcomes.length;
      const accuracy = total ? Math.round((score / total) * 100) : 0;
      const completedAt = new Date().toISOString();

      if (!user || !supabase) {
        const calculation = calculateMastery(mastery, session.outcomes, session.difficulty);
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
        setAdaptivePractice(
          deriveAdaptiveState(session.outcomes, session.difficulty, false, session.topic),
        );
        return;
      }

      setSyncing(true);
      setSyncError(null);

      try {
        const subjectQuery = supabase.from("subjects").select("id");
        const { data: subject, error: subjectError } = session.subjectId
          ? await subjectQuery.eq("id", session.subjectId).single()
          : await subjectQuery.eq("slug", "mathematics").single();

        if (subjectError || !subject) throw supabaseError("subject-load", subjectError);

        const topicQuery = supabase.from("topics").select("id,name").eq("subject_id", subject.id);
        const { data: topic, error: topicError } = session.topicId
          ? await topicQuery.eq("id", session.topicId).maybeSingle()
          : await topicQuery.eq("slug", "factorisation").maybeSingle();

        if (topicError || !topic) throw supabaseError("topic-load", topicError);

        const { data: learnerSubject, error: learnerSubjectError } = await supabase
          .from("learner_subjects")
          .upsert(
            { user_id: user.id, subject_id: subject.id, status: "active" },
            { onConflict: "user_id,subject_id" },
          )
          .select("id")
          .single();

        if (learnerSubjectError || !learnerSubject) {
          throw supabaseError("learner-subject-upsert", learnerSubjectError);
        }

        const { data: existingProgress, error: existingProgressError } = await supabase
          .from("topic_progress")
          .select("id,mastery,difficulty,attempted_count,correct_count")
          .eq("user_id", user.id)
          .eq("topic_id", topic.id)
          .maybeSingle();

        if (existingProgressError) throw supabaseError("progress-load", existingProgressError);

        const startingMastery = clampRounded(Number(existingProgress?.mastery ?? 0), 0, 100);
        const startingDifficulty = Number(existingProgress?.difficulty ?? session.difficulty) || 3;
        const calculation = calculateMastery(startingMastery, session.outcomes, startingDifficulty);
        const attemptedCount = (existingProgress?.attempted_count ?? 0) + total;
        const correctCount = (existingProgress?.correct_count ?? 0) + score;

        const grouped = new Map<string, MisconceptionEvidenceGroup>();
        for (const attempt of session.attempts) {
          if (attempt.isCorrect || !attempt.misconceptionKey || !attempt.misconceptionCategory) continue;
          const identity = `${attempt.misconceptionKey}::${attempt.misconceptionCategory}`;
          const current = grouped.get(identity);
          if (current) current.count += 1;
          else {
            grouped.set(identity, {
              key: attempt.misconceptionKey,
              category: attempt.misconceptionCategory,
              count: 1,
              occurrenceCount: 1,
              status: "active",
            });
          }
        }

        for (const group of grouped.values()) {
          let previousCount = 0;
          if (existingProgress) {
            const { data, error } = await supabase
              .from("misconception_state")
              .select("occurrence_count")
              .eq("user_id", user.id)
              .eq("topic_progress_id", existingProgress.id)
              .eq("concept_name", group.key)
              .eq("category", group.category)
              .maybeSingle();

            if (error) throw supabaseError("misconception-load", error);
            previousCount = data?.occurrence_count ?? 0;
          }

          group.occurrenceCount = previousCount + group.count;
          group.status = group.occurrenceCount >= 2 ? "recurring" : "active";
        }

        const recurringMisconception = [...grouped.values()].some(
          (group) => group.status === "recurring",
        );
        const nextAdaptive = deriveAdaptiveState(
          session.outcomes,
          startingDifficulty,
          recurringMisconception,
          session.topic,
        );
        const primaryMisconception =
          [...grouped.values()].find((group) => group.status === "recurring") ??
          [...grouped.values()][0] ??
          null;

        const dbIntervention = persistenceIntervention(nextAdaptive.intervention);
        const { data: progress, error: progressError } = await supabase
          .from("topic_progress")
          .upsert(
            {
              user_id: user.id,
              learner_subject_id: learnerSubject.id,
              topic_id: topic.id,
              mastery: calculation.mastery,
              recent_accuracy: accuracy,
              difficulty: nextAdaptive.difficulty,
              attempted_count: attemptedCount,
              correct_count: correctCount,
              recommended_intervention: dbIntervention,
              last_practiced_at: completedAt,
            },
            { onConflict: "user_id,topic_id" },
          )
          .select("id")
          .single();

        if (progressError || !progress) throw supabaseError("progress-upsert", progressError);

        const sessionKey = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        for (let index = 0; index < session.attempts.length; index += 1) {
          const attempt = session.attempts[index];
          const isMisconceptionEvidence =
            !attempt.isCorrect && Boolean(attempt.misconceptionKey && attempt.misconceptionCategory);
          const identity = isMisconceptionEvidence
            ? `${attempt.misconceptionKey}::${attempt.misconceptionCategory}`
            : null;
          const evidence = identity ? grouped.get(identity) : null;

          const { error } = await supabase.rpc("persist_practice_result", {
            p_submission_key: `${sessionKey}-${index + 1}`,
            p_learner_subject_id: learnerSubject.id,
            p_topic_progress_id: progress.id,
            p_topic_id: topic.id,
            p_concept_name: attempt.conceptName ?? session.topic,
            p_difficulty: session.difficulty,
            p_question_snapshot: {
              prompt: attempt.prompt,
              question_type: attempt.questionType ?? "multiple_choice",
              source: "mobile_native",
            },
            p_expected_answer: { accepted: [attempt.expectedAnswer] },
            p_learner_answer: { value: attempt.learnerAnswer },
            p_is_correct: attempt.isCorrect,
            p_response_time_ms: null,
            p_misconception_key: isMisconceptionEvidence ? attempt.misconceptionKey : null,
            p_misconception_category: isMisconceptionEvidence
              ? attempt.misconceptionCategory
              : null,
            p_misconception_status: evidence?.status ?? null,
            p_misconception_occurrence_count: evidence?.occurrenceCount ?? null,
            p_misconception_evidence_summary: evidence
              ? `Learner answer suggests ${humanizeMisconception(evidence.key)}.`
              : null,
            p_subject_name_snapshot: session.subject,
            p_topic_name_snapshot: session.topic,
            p_learning_session_id: null,
            p_mastery: calculation.mastery,
            p_recent_accuracy: accuracy,
            p_next_difficulty: nextAdaptive.difficulty,
            p_attempted_count: attemptedCount,
            p_correct_count: correctCount,
            p_consecutive_correct: 0,
            p_consecutive_incorrect: 0,
            p_recommended_intervention: dbIntervention,
          });

          if (error) throw supabaseError(`attempt-persist-${index + 1}`, error);
        }

        const sessionMatchesActiveTopic = !activeTopicIdRef.current || activeTopicIdRef.current === topic.id;
        if (sessionMatchesActiveTopic) {
          setMastery(calculation.mastery);
          setMasterySource("supabase");
          setAdaptivePractice(nextAdaptive);

          if (primaryMisconception) {
            setMisconception({
              category: primaryMisconception.category,
              status: primaryMisconception.status,
              occurrenceCount: primaryMisconception.occurrenceCount,
              message: misconceptionMessage(
                primaryMisconception.key,
                primaryMisconception.status,
                nextAdaptive.intervention,
              ),
            });
          } else if (misconception) {
            setMisconception({
              ...misconception,
              status: "improving",
              message: misconceptionMessage(
                misconception.category,
                "improving",
                nextAdaptive.intervention,
              ),
            });
          } else {
            setMisconception(null);
          }
        }

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
      } catch (error) {
        const detail = error instanceof Error ? error.message : JSON.stringify(error);
        setSyncError(
          `Practice finished locally, but Nomi could not save all learner evidence to Supabase yet. (${detail})`,
        );
      } finally {
        setSyncing(false);
      }
    },
    [mastery, misconception, user],
  );

  const value = useMemo<PracticeProgressContextValue>(
    () => ({
      latestSession,
      mastery,
      masterySource,
      adaptivePractice,
      misconception,
      activeTopicId,
      activeTopicName,
      syncing,
      syncError,
      setActiveTopic,
      recordSession,
    }),
    [
      latestSession,
      mastery,
      masterySource,
      adaptivePractice,
      misconception,
      activeTopicId,
      activeTopicName,
      syncing,
      syncError,
      setActiveTopic,
      recordSession,
    ],
  );

  return <PracticeProgressContext.Provider value={value}>{children}</PracticeProgressContext.Provider>;
}

export function usePracticeProgress() {
  const context = useContext(PracticeProgressContext);
  if (!context) throw new Error("usePracticeProgress must be used within PracticeProgressProvider");
  return context;
}
