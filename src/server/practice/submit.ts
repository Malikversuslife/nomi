import "server-only";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import type { AdaptiveAttempt, MisconceptionStatus } from "@/domain/adaptive/types";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import { selectNextQuestion } from "@/domain/practice/select-next-question";
import type { Json, PersistedMisconceptionState, PracticeAttempt, PracticeQuestion, Subject, Topic } from "@/server/supabase/types";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { requireUser } from "@/server/supabase/auth";
import { mapPracticeQuestion, toLearnerSafeQuestion } from "./questions";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "./misconceptions";
import { practiceSubmissionSchema, type PracticeSubmissionInput } from "./schemas";
import type { PracticeActionState, PracticeResult } from "./types";

type QuestionContext = {
  question: PracticeQuestion;
  topic: Topic;
  subject: Subject;
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

export async function getInitialPracticeState(): Promise<PracticeActionState> {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data: progress } = await supabase.from("topic_progress").select("difficulty").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const targetDifficulty = progress?.difficulty ?? 2;
  const { data: questions, error } = await supabase.from("practice_questions").select("*").eq("active", true).order("difficulty", { ascending: true });

  if (error) {
    throw new Error(`Unable to load practice questions: ${error.message}`);
  }

  const selection = selectNextQuestion({ questions: questions.map(mapPracticeQuestion), targetDifficulty });

  return { question: selection.question ? toLearnerSafeQuestion(selection.question) : null };
}

async function getQuestionContext(questionId: string): Promise<QuestionContext> {
  const supabase = await createServerSupabaseClient();
  const { data: question, error: questionError } = await supabase.from("practice_questions").select("*").eq("id", questionId).eq("active", true).single();

  if (questionError || !question) {
    throw new Error("Practice question was not found.");
  }

  const { data: topic, error: topicError } = await supabase.from("topics").select("*").eq("id", question.topic_id).single();

  if (topicError || !topic) {
    throw new Error("Practice question topic was not found.");
  }

  const { data: subject, error: subjectError } = await supabase.from("subjects").select("*").eq("id", topic.subject_id).single();

  if (subjectError || !subject) {
    throw new Error("Practice question subject was not found.");
  }

  return { question, topic, subject };
}

export async function submitPracticeAttempt(input: PracticeSubmissionInput): Promise<PracticeResult> {
  const parsed = practiceSubmissionSchema.parse(input);
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { question, topic, subject } = await getQuestionContext(parsed.questionId);
  const domainQuestion = mapPracticeQuestion(question);
  const evaluation = evaluateAnswer(domainQuestion, parsed.learnerAnswer);

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
    misconceptionKey: evaluation.misconceptionKey,
  };
  const misconceptionIdentity = getMisconceptionIdentity({
    topicProgressId: topicProgress.id,
    misconceptionKey: evaluation.misconceptionKey ?? question.misconception_key,
    misconceptionCategory: evaluation.misconceptionCategory ?? question.misconception_category,
  });
  const misconceptionQuery = misconceptionIdentity
    ? await supabase.from("misconception_state").select("*").eq("user_id", user.id).eq("topic_progress_id", misconceptionIdentity.topicProgressId).eq("concept_name", misconceptionIdentity.key).eq("category", misconceptionIdentity.category).maybeSingle()
    : { data: null, error: null };
  const previousMisconception = misconceptionQuery.data as PersistedMisconceptionState | null;
  const shouldUpdateMisconception = Boolean(evaluation.misconceptionKey || previousMisconception);
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
    question_type: question.question_type,
    options: question.options,
    misconception_key: question.misconception_key,
  };
  const misconception = learnerState.misconceptionSummary;
  const { data: persisted, error: persistError } = await supabase.rpc("persist_practice_result", {
    p_submission_key: parsed.submissionKey,
    p_learner_subject_id: learnerSubject.id,
    p_topic_progress_id: topicProgress.id,
    p_topic_id: topic.id,
    p_concept_name: question.concept_name,
    p_difficulty: question.difficulty,
    p_question_snapshot: questionSnapshot,
    p_expected_answer: question.expected_answer,
    p_learner_answer: evaluation.normalizedLearnerAnswer,
    p_is_correct: evaluation.isCorrect,
    p_response_time_ms: parsed.responseTimeMs ?? null,
    p_misconception_key: misconception?.key ?? null,
    p_misconception_category: evaluation.misconceptionCategory,
    p_misconception_status: misconception?.status ?? null,
    p_misconception_occurrence_count: misconception?.occurrenceCount ?? null,
    p_misconception_evidence_summary: misconception ? `Deterministic evidence for ${misconception.key}.` : null,
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

  const { data: nextQuestionRows, error: nextQuestionError } = await supabase.from("practice_questions").select("*").eq("topic_id", topic.id).eq("active", true).order("difficulty");

  if (nextQuestionError) {
    throw new Error(`Unable to select next question: ${nextQuestionError.message}`);
  }

  const nextSelection = selectNextQuestion({
    questions: nextQuestionRows.map(mapPracticeQuestion),
    targetDifficulty: learnerState.difficulty,
    previousQuestionId: question.id,
  });

  return {
    correct: evaluation.isCorrect,
    correctAnswer: expectedAnswerLabel(question.expected_answer),
    explanation: question.explanation,
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
    nextQuestion: nextSelection.question ? toLearnerSafeQuestion(nextSelection.question) : null,
    nextQuestionReasonCode: nextSelection.reasonCode,
  };
}
