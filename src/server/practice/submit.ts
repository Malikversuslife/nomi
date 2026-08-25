import "server-only";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import type { AdaptiveAttempt, MisconceptionStatus } from "@/domain/adaptive/types";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import { selectNextQuestion } from "@/domain/practice/select-next-question";
import type { PracticeQuestion as DomainPracticeQuestion } from "@/domain/practice/types";
import { classifyMisconception } from "@/server/ai/misconception-classifier";
import { generatePracticeQuestion } from "@/server/ai/questions";
import type { Json, PersistedMisconceptionState, PracticeAttempt, Subject, Topic } from "@/server/supabase/types";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { requireUser } from "@/server/supabase/auth";
import { isGeneratedQuestionToken, openGeneratedQuestion, sealGeneratedQuestion } from "./generated-question-token";
import { mapPracticeQuestion, toLearnerSafeQuestion } from "./questions";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "./misconceptions";
import { practiceSubmissionSchema, type PracticeSubmissionInput } from "./schemas";
import type { PracticeActionState, PracticeResult } from "./types";

type QuestionContext = {
  question: DomainPracticeQuestion;
  topic: Topic;
  subject: Subject;
  hint?: string;
  source: "seeded" | "ai_generated";
};

function expectedAnswerLabel(expectedAnswer: Json) {
  if (!expectedAnswer || typeof expectedAnswer !== "object" || Array.isArray(expectedAnswer)) {
    return "";
  }

  if (typeof expectedAnswer.option_id === "string") {
    return expectedAnswer.option_id;
  }

  if (Array.isArray(expectedAnswer.accepted)) {
    const [first] = expectedAnswer.accepted;
    return typeof first === "string" ? first : "";
  }

  return "";
}

function persistedAttemptToEvidence(attempt: Pick<PracticeAttempt, "id" | "is_correct" | "difficulty" | "created_at" | "misconception_category" | "question_snapshot">): AdaptiveAttempt {
  const snapshot = attempt.question_snapshot && typeof attempt.question_snapshot === "object" && !Array.isArray(attempt.question_snapshot) ? attempt.question_snapshot : {};

  return {
    id: attempt.id,
    isCorrect: attempt.is_correct === true,
    difficulty: attempt.difficulty,
    createdAt: attempt.created_at,
    misconceptionKey: attempt.is_correct === false && typeof snapshot.misconception_key === "string" ? snapshot.misconception_key : null,
  };
}

async function loadTopicAndSubject(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, topicId: string) {
  const { data: topic, error: topicError } = await supabase.from("topics").select("*").eq("id", topicId).single();

  if (topicError || !topic) {
    throw new Error("Practice question topic was not found.");
  }

  const { data: subject, error: subjectError } = await supabase.from("subjects").select("*").eq("id", topic.subject_id).single();

  if (subjectError || !subject) {
    throw new Error("Practice question subject was not found.");
  }

  return { topic, subject };
}

function summariseProgress(progress: { mastery: number; recent_accuracy: number; difficulty: number; consecutive_correct: number; consecutive_incorrect: number; recommended_intervention: string | null }) {
  return `mastery ${progress.mastery}, recent accuracy ${progress.recent_accuracy}, difficulty ${progress.difficulty}, streak +${progress.consecutive_correct}/-${progress.consecutive_incorrect}, intervention ${progress.recommended_intervention ?? "continue"}`;
}

async function selectPracticeQuestionForState(input: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  topic: Topic;
  subject: Subject;
  targetDifficulty: number;
  intervention: string;
  recentSummary: string;
  previousQuestionId?: string;
}) {
  const aiQuestion = await generatePracticeQuestion({
    subjectName: input.subject.name,
    topicId: input.topic.id,
    topicName: input.topic.name,
    targetDifficulty: input.targetDifficulty,
    intervention: input.intervention,
    recentSummary: input.recentSummary,
  });
  const token = aiQuestion ? sealGeneratedQuestion({ question: aiQuestion.question, hint: aiQuestion.hint }) : null;

  if (aiQuestion && token) {
    return toLearnerSafeQuestion(aiQuestion.question, { id: token, hint: aiQuestion.hint, source: "ai_generated" });
  }

  const { data: rows, error } = await input.supabase.from("practice_questions").select("*").eq("topic_id", input.topic.id).eq("active", true).order("difficulty");

  if (error) {
    throw new Error(`Unable to select practice question: ${error.message}`);
  }

  const selection = selectNextQuestion({ questions: rows.map(mapPracticeQuestion), targetDifficulty: input.targetDifficulty, previousQuestionId: input.previousQuestionId });

  return selection.question ? toLearnerSafeQuestion(selection.question) : null;
}

export async function getInitialPracticeState(): Promise<PracticeActionState> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: progress } = await supabase.from("topic_progress").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const { data: fallbackRows, error } = await supabase.from("practice_questions").select("*").eq("active", true).order("difficulty", { ascending: true });

  if (error) {
    throw new Error(`Unable to load practice questions: ${error.message}`);
  }

  const fallbackSelection = selectNextQuestion({ questions: fallbackRows.map(mapPracticeQuestion), targetDifficulty: progress?.difficulty ?? 2 });

  if (!progress || !fallbackSelection.question) {
    return { question: fallbackSelection.question ? toLearnerSafeQuestion(fallbackSelection.question) : null };
  }

  const { topic, subject } = await loadTopicAndSubject(supabase, progress.topic_id);
  const question = await selectPracticeQuestionForState({ supabase, topic, subject, targetDifficulty: progress.difficulty, intervention: progress.recommended_intervention ?? "continue", recentSummary: summariseProgress(progress) });

  return { question };
}

async function getQuestionContext(questionId: string): Promise<QuestionContext> {
  const supabase = await createServerSupabaseClient();

  if (isGeneratedQuestionToken(questionId)) {
    const payload = openGeneratedQuestion(questionId);

    if (!payload) {
      throw new Error("Generated practice question is unavailable. Try another question.");
    }

    const { topic, subject } = await loadTopicAndSubject(supabase, payload.question.topicId);

    return { question: payload.question, topic, subject, hint: payload.hint, source: "ai_generated" };
  }

  const { data: question, error: questionError } = await supabase.from("practice_questions").select("*").eq("id", questionId).eq("active", true).single();

  if (questionError || !question) {
    throw new Error("Practice question was not found.");
  }

  const { topic, subject } = await loadTopicAndSubject(supabase, question.topic_id);

  return { question: mapPracticeQuestion(question), topic, subject, source: "seeded" };
}

export async function submitPracticeAttempt(input: PracticeSubmissionInput): Promise<PracticeResult> {
  const parsed = practiceSubmissionSchema.parse(input);
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { question, topic, subject, hint, source } = await getQuestionContext(parsed.questionId);
  const domainQuestion = question;
  const evaluation = evaluateAnswer(domainQuestion, parsed.learnerAnswer);
  const aiClassification = !evaluation.isCorrect
    ? await classifyMisconception({
        subjectName: subject.name,
        topicName: topic.name,
        conceptName: question.conceptName,
        questionPrompt: question.prompt,
        correctAnswer: question.expectedAnswer,
        learnerAnswer: evaluation.normalizedLearnerAnswer,
        candidateKeys: [question.misconceptionKey].filter((key): key is string => Boolean(key)),
      })
    : null;
  const classifiedMisconceptionKey = aiClassification?.misconception_key ?? evaluation.misconceptionKey;
  const classifiedMisconceptionCategory = aiClassification?.category ?? evaluation.misconceptionCategory;

  const { data: learnerSubject, error: learnerSubjectError } = await supabase
    .from("learner_subjects")
    .upsert({ user_id: user.id, subject_id: subject.id, status: "active" }, { onConflict: "user_id,subject_id" })
    .select("*")
    .single();

  if (learnerSubjectError || !learnerSubject) {
    throw new Error(`Unable to prepare learner subject: ${learnerSubjectError?.message ?? "unknown error"}`);
  }

  const { data: topicProgress, error: topicProgressError } = await supabase
    .from("topic_progress")
    .upsert({ user_id: user.id, learner_subject_id: learnerSubject.id, topic_id: topic.id }, { onConflict: "user_id,topic_id" })
    .select("*")
    .single();

  if (topicProgressError || !topicProgress) {
    throw new Error(`Unable to prepare topic progress: ${topicProgressError?.message ?? "unknown error"}`);
  }

  const { data: previousAttempts, error: attemptsError } = await supabase
    .from("practice_attempts")
    .select("id,is_correct,difficulty,created_at,misconception_category,question_snapshot")
    .eq("topic_progress_id", topicProgress.id)
    .order("created_at", { ascending: true })
    .limit(16);

  if (attemptsError) {
    throw new Error(`Unable to load previous attempts: ${attemptsError.message}`);
  }

  const previousEvidence = previousAttempts.map(persistedAttemptToEvidence);
  const currentEvidence: AdaptiveAttempt = {
    isCorrect: evaluation.isCorrect,
    difficulty: question.difficulty,
    misconceptionKey: classifiedMisconceptionKey,
  };
  const misconceptionIdentity = getMisconceptionIdentity({
    topicProgressId: topicProgress.id,
    misconceptionKey: classifiedMisconceptionKey ?? question.misconceptionKey,
    misconceptionCategory: classifiedMisconceptionCategory ?? question.misconceptionCategory,
  });
  const misconceptionQuery = misconceptionIdentity
    ? await supabase.from("misconception_state").select("*").eq("user_id", user.id).eq("topic_progress_id", misconceptionIdentity.topicProgressId).eq("concept_name", misconceptionIdentity.key).eq("category", misconceptionIdentity.category).maybeSingle()
    : { data: null, error: null };
  const previousMisconception = misconceptionQuery.data as PersistedMisconceptionState | null;
  const shouldUpdateMisconception = Boolean(classifiedMisconceptionKey || previousMisconception);
  const misconceptionLifecycle = misconceptionIdentity
    ? buildMisconceptionLifecycleInput({
        identity: misconceptionIdentity,
        previous: previousMisconception,
        previousAttempts: previousEvidence,
        currentAttempt: currentEvidence,
      })
    : null;
  const learnerState = deriveLearnerState({
    currentMastery: topicProgress.mastery,
    currentDifficulty: topicProgress.difficulty,
    attempts: [...previousEvidence, currentEvidence],
    misconceptionAttempts: shouldUpdateMisconception ? misconceptionLifecycle?.attempts : undefined,
    misconceptionKey: shouldUpdateMisconception ? misconceptionIdentity?.key : null,
    misconceptionStatus: previousMisconception?.status as MisconceptionStatus | undefined,
    misconceptionOccurrenceCount: shouldUpdateMisconception ? misconceptionLifecycle?.occurrenceCount : previousMisconception?.occurrence_count,
  });
  const attemptedCount = topicProgress.attempted_count + 1;
  const correctCount = topicProgress.correct_count + (evaluation.isCorrect ? 1 : 0);

  const questionSnapshot: Json = {
    question_id: question.id,
    prompt: question.prompt,
    question_type: question.questionType,
    options: question.options,
    source,
    hint,
    misconception_key: question.misconceptionKey,
  };
  const misconception = learnerState.misconceptionSummary;
  const { data: persisted, error: persistError } = await supabase.rpc("persist_practice_result", {
    p_submission_key: parsed.submissionKey,
    p_learner_subject_id: learnerSubject.id,
    p_topic_progress_id: topicProgress.id,
    p_topic_id: topic.id,
    p_concept_name: question.conceptName,
    p_difficulty: question.difficulty,
    p_question_snapshot: questionSnapshot,
    p_expected_answer: question.expectedAnswer,
    p_learner_answer: evaluation.normalizedLearnerAnswer,
    p_is_correct: evaluation.isCorrect,
    p_response_time_ms: parsed.responseTimeMs ?? null,
    p_misconception_key: misconception?.key ?? null,
    p_misconception_category: misconceptionIdentity?.category ?? classifiedMisconceptionCategory,
    p_misconception_status: misconception?.status ?? null,
    p_misconception_occurrence_count: misconception?.occurrenceCount ?? null,
    p_misconception_evidence_summary: misconception ? aiClassification?.evidence_summary ?? `Deterministic evidence for ${misconception.key}.` : null,
    p_subject_name_snapshot: subject.name,
    p_topic_name_snapshot: topic.name,
    p_learning_session_id: parsed.learningSessionId ?? null,
    p_mastery: learnerState.mastery,
    p_recent_accuracy: learnerState.recentAccuracy.weightedAccuracyPercentage,
    p_next_difficulty: learnerState.difficulty,
    p_attempted_count: attemptedCount,
    p_correct_count: correctCount,
    p_consecutive_correct: learnerState.consecutiveCorrect,
    p_consecutive_incorrect: learnerState.consecutiveIncorrect,
    p_recommended_intervention: learnerState.recommendedIntervention.type,
  });

  if (persistError || !persisted?.[0]) {
    throw new Error(`Unable to persist practice result: ${persistError?.message ?? "unknown error"}`);
  }

  const nextQuestion = await selectPracticeQuestionForState({
    supabase,
    topic,
    subject,
    targetDifficulty: learnerState.difficulty,
    intervention: learnerState.recommendedIntervention.type,
    recentSummary: summariseProgress({ ...topicProgress, mastery: learnerState.mastery, recent_accuracy: learnerState.recentAccuracy.weightedAccuracyPercentage, difficulty: learnerState.difficulty, recommended_intervention: learnerState.recommendedIntervention.type }),
    previousQuestionId: question.id,
  });

  return {
    correct: evaluation.isCorrect,
    correctAnswer: expectedAnswerLabel(question.expectedAnswer),
    explanation: question.explanation,
    hint,
    mastery: learnerState.mastery,
    masteryChange: learnerState.mastery - topicProgress.mastery,
    difficulty: learnerState.difficulty,
    difficultyChange: learnerState.difficulty - topicProgress.difficulty,
    recentAccuracy: learnerState.recentAccuracy.weightedAccuracyPercentage,
    intervention: learnerState.recommendedIntervention.type,
    adaptationReasonCode: learnerState.adaptationReasonCode,
    consecutiveCorrect: learnerState.consecutiveCorrect,
    consecutiveIncorrect: learnerState.consecutiveIncorrect,
    attemptInserted: persisted[0].inserted,
    nextQuestion,
    nextQuestionReasonCode: nextQuestion?.source === "ai_generated" ? "ai_generated" : "closest_difficulty",
  };
}
