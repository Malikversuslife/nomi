import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import type { AdaptiveAttempt, MisconceptionStatus } from "@/domain/adaptive/types";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import { selectNextQuestion } from "@/domain/practice/select-next-question";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "@/server/practice/misconceptions";
import type { PracticeQuestion as DomainPracticeQuestion } from "@/domain/practice/types";
import type { Database, Json, PracticeAttempt, PracticeQuestion } from "@/server/supabase/types";

function loadLocalEnv() {
  for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2];
    }
  }
}

function fail(message: string): never {
  console.log(`failure=${message.replace(/[\r\n=]+/g, " ").slice(0, 260)}`);
  process.exit(1);
}

function ok(label: string) {
  console.log(`${label}=pass`);
}

function client() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapQuestion(row: PracticeQuestion): DomainPracticeQuestion {
  return {
    id: row.id,
    topicId: row.topic_id,
    conceptName: row.concept_name,
    difficulty: row.difficulty,
    questionType: row.question_type,
    prompt: row.prompt,
    options: Array.isArray(row.options) ? row.options.flatMap((option) => (option && typeof option === "object" && !Array.isArray(option) && typeof option.id === "string" && typeof option.label === "string" ? [{ id: option.id, label: option.label }] : [])) : null,
    expectedAnswer: row.expected_answer,
    explanation: row.explanation,
    misconceptionKey: row.misconception_key,
    misconceptionCategory: row.misconception_category,
  };
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

async function signIn(label: string, email: string, password: string) {
  const supabase = client();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    fail(`${label}_signin_failed:${error?.message ?? "no user"}`);
  }

  ok(`${label}_signin`);
  return { supabase, userId: data.user.id };
}

async function getSeedContext(supabase: ReturnType<typeof client>) {
  const subjects = await supabase.from("subjects").select("*").eq("slug", "mathematics").single();
  if (subjects.error || !subjects.data) fail(`subject_lookup_failed:${subjects.error?.message ?? "missing"}`);
  const topics = await supabase.from("topics").select("*").eq("slug", "factorisation").eq("subject_id", subjects.data.id).single();
  if (topics.error || !topics.data) fail(`topic_lookup_failed:${topics.error?.message ?? "missing"}`);
  const questions = await supabase.from("practice_questions").select("*").eq("topic_id", topics.data.id).eq("active", true).order("difficulty");
  if (questions.error || !questions.data || questions.data.length < 5) fail(`question_seed_lookup_failed:${questions.error?.message ?? questions.data?.length ?? "missing"}`);

  return { subject: subjects.data, topic: topics.data, questions: questions.data.map(mapQuestion) };
}

async function ensureProgress(supabase: ReturnType<typeof client>, userId: string, subjectId: string, topicId: string) {
  const learnerSubject = await supabase.from("learner_subjects").upsert({ user_id: userId, subject_id: subjectId, status: "active" }, { onConflict: "user_id,subject_id" }).select("*").single();
  if (learnerSubject.error || !learnerSubject.data) fail(`learner_subject_failed:${learnerSubject.error?.message ?? "missing"}`);
  const progress = await supabase.from("topic_progress").upsert({ user_id: userId, learner_subject_id: learnerSubject.data.id, topic_id: topicId }, { onConflict: "user_id,topic_id" }).select("*").single();
  if (progress.error || !progress.data) fail(`topic_progress_failed:${progress.error?.message ?? "missing"}`);

  return { learnerSubject: learnerSubject.data, progress: progress.data };
}

async function submitSeededAttempt(input: {
  supabase: ReturnType<typeof client>;
  userId: string;
  subjectName: string;
  topicName: string;
  learnerSubjectId: string;
  progressId: string;
  topicId: string;
  currentMastery: number;
  currentDifficulty: number;
  attemptedCount: number;
  correctCount: number;
  questions: DomainPracticeQuestion[];
  answerCorrectly: boolean;
  submissionKey: string;
}) {
  const selected = selectNextQuestion({ questions: input.questions, targetDifficulty: input.currentDifficulty }).question;
  if (!selected) fail("no_question_selected");
  const learnerAnswer = input.answerCorrectly ? (selected.questionType === "multiple_choice" && selected.expectedAnswer && typeof selected.expectedAnswer === "object" && !Array.isArray(selected.expectedAnswer) ? { option_id: selected.expectedAnswer.option_id } : { value: Array.isArray((selected.expectedAnswer as { accepted?: unknown[] }).accepted) ? String((selected.expectedAnswer as { accepted: unknown[] }).accepted[0]) : "" }) : selected.questionType === "multiple_choice" ? { option_id: "not-correct" } : { value: "not correct" };
  const evaluation = evaluateAnswer(selected, learnerAnswer);
  const attempts = await input.supabase.from("practice_attempts").select("id,is_correct,difficulty,created_at,misconception_category,question_snapshot").eq("topic_progress_id", input.progressId).order("created_at", { ascending: true }).limit(16);
  if (attempts.error || !attempts.data) fail(`previous_attempts_failed:${attempts.error?.message ?? "missing"}`);
  const previousEvidence = attempts.data.map(persistedAttemptToEvidence);
  const misconceptionIdentity = getMisconceptionIdentity({ topicProgressId: input.progressId, misconceptionKey: evaluation.misconceptionKey ?? selected.misconceptionKey, misconceptionCategory: evaluation.misconceptionCategory ?? selected.misconceptionCategory });
  const previousMisconception = misconceptionIdentity ? await input.supabase.from("misconception_state").select("status,occurrence_count").eq("user_id", input.userId).eq("topic_progress_id", misconceptionIdentity.topicProgressId).eq("concept_name", misconceptionIdentity.key).eq("category", misconceptionIdentity.category).maybeSingle() : { data: null, error: null };
  if (previousMisconception.error) fail(`previous_misconception_failed:${previousMisconception.error.message}`);
  const currentEvidence = { isCorrect: evaluation.isCorrect, difficulty: selected.difficulty, misconceptionKey: evaluation.misconceptionKey };
  const shouldUpdateMisconception = Boolean(evaluation.misconceptionKey || previousMisconception.data);
  const misconceptionLifecycle = shouldUpdateMisconception && misconceptionIdentity ? buildMisconceptionLifecycleInput({ identity: misconceptionIdentity, previous: previousMisconception.data, previousAttempts: previousEvidence, currentAttempt: currentEvidence }) : null;
  const learnerState = deriveLearnerState({
    currentMastery: input.currentMastery,
    currentDifficulty: input.currentDifficulty,
    attempts: [...previousEvidence, currentEvidence],
    misconceptionAttempts: misconceptionLifecycle?.attempts,
    misconceptionKey: shouldUpdateMisconception ? misconceptionIdentity?.key : null,
    misconceptionStatus: previousMisconception.data?.status as MisconceptionStatus | undefined,
    misconceptionOccurrenceCount: shouldUpdateMisconception ? misconceptionLifecycle?.occurrenceCount : previousMisconception.data?.occurrence_count,
  });
  const persisted = await input.supabase.rpc("persist_practice_result", {
    p_submission_key: input.submissionKey,
    p_learner_subject_id: input.learnerSubjectId,
    p_topic_progress_id: input.progressId,
    p_topic_id: input.topicId,
    p_concept_name: selected.conceptName,
    p_difficulty: selected.difficulty,
    p_question_snapshot: { question_id: selected.id, prompt: selected.prompt, question_type: selected.questionType, options: selected.options, misconception_key: selected.misconceptionKey } as Json,
    p_expected_answer: selected.expectedAnswer,
    p_learner_answer: evaluation.normalizedLearnerAnswer,
    p_is_correct: evaluation.isCorrect,
    p_response_time_ms: 900,
    p_misconception_key: learnerState.misconceptionSummary?.key ?? null,
    p_misconception_category: evaluation.misconceptionCategory,
    p_misconception_status: learnerState.misconceptionSummary?.status ?? null,
    p_misconception_occurrence_count: learnerState.misconceptionSummary?.occurrenceCount ?? null,
    p_misconception_evidence_summary: learnerState.misconceptionSummary ? `Deterministic evidence for ${learnerState.misconceptionSummary.key}.` : null,
    p_subject_name_snapshot: input.subjectName,
    p_topic_name_snapshot: input.topicName,
    p_learning_session_id: null,
    p_mastery: learnerState.mastery,
    p_recent_accuracy: learnerState.recentAccuracy.weightedAccuracyPercentage,
    p_next_difficulty: learnerState.difficulty,
    p_attempted_count: input.attemptedCount + 1,
    p_correct_count: input.correctCount + (evaluation.isCorrect ? 1 : 0),
    p_consecutive_correct: learnerState.consecutiveCorrect,
    p_consecutive_incorrect: learnerState.consecutiveIncorrect,
    p_recommended_intervention: learnerState.recommendedIntervention.type,
  });
  if (persisted.error || !persisted.data?.[0]) fail(`persist_rpc_failed:${persisted.error?.message ?? "missing"}`);

  return { selected, evaluation, learnerState, persisted: persisted.data[0] };
}

loadLocalEnv();

for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "TEST_USER_A_EMAIL", "TEST_USER_A_PASSWORD", "TEST_USER_B_EMAIL", "TEST_USER_B_PASSWORD"]) {
  if (!process.env[key]) fail(`missing_env_${key}`);
}

const userA = await signIn("user_a", process.env.TEST_USER_A_EMAIL!, process.env.TEST_USER_A_PASSWORD!);
const userB = await signIn("user_b", process.env.TEST_USER_B_EMAIL!, process.env.TEST_USER_B_PASSWORD!);
const seed = await getSeedContext(userA.supabase);
ok("seeded_questions_accessible");
const a = await ensureProgress(userA.supabase, userA.userId, seed.subject.id, seed.topic.id);
const b = await ensureProgress(userB.supabase, userB.userId, seed.subject.id, seed.topic.id);
ok("learner_progress_prepared");

let currentProgress = a.progress;
let difficultyIncreased = false;
let lastQuestionId = "";

for (let index = 0; index < 5 && !difficultyIncreased; index += 1) {
  const result = await submitSeededAttempt({
    supabase: userA.supabase,
    userId: userA.userId,
    subjectName: seed.subject.name,
    topicName: seed.topic.name,
    learnerSubjectId: a.learnerSubject.id,
    progressId: currentProgress.id,
    topicId: seed.topic.id,
    currentMastery: currentProgress.mastery,
    currentDifficulty: currentProgress.difficulty,
    attemptedCount: currentProgress.attempted_count,
    correctCount: currentProgress.correct_count,
    questions: seed.questions,
    answerCorrectly: true,
    submissionKey: crypto.randomUUID(),
  });
  if (!result.persisted.inserted) fail("fresh_submission_was_not_inserted");
  const refreshed = await userA.supabase.from("topic_progress").select("*").eq("id", currentProgress.id).single();
  if (refreshed.error || !refreshed.data) fail(`refresh_progress_failed:${refreshed.error?.message ?? "missing"}`);
  difficultyIncreased = refreshed.data.difficulty > currentProgress.difficulty;
  currentProgress = refreshed.data;
  lastQuestionId = result.selected.id;
  console.log(`sequence_attempt_${index + 1}=difficulty:${result.selected.difficulty},correct:${result.evaluation.isCorrect},mastery:${currentProgress.mastery},next_difficulty:${currentProgress.difficulty},intervention:${currentProgress.recommended_intervention}`);
}

if (!difficultyIncreased) fail("adaptive_sequence_did_not_raise_difficulty_after_repeated_success");
ok("adaptive_success_sequence_changed_difficulty");
const nextQuestion = selectNextQuestion({ questions: seed.questions, targetDifficulty: currentProgress.difficulty, previousQuestionId: lastQuestionId });
if (!nextQuestion.question || nextQuestion.question.id === lastQuestionId || Math.abs(nextQuestion.question.difficulty - currentProgress.difficulty) > 2) fail("next_question_selection_invalid");
ok("next_question_selected_from_updated_difficulty");

const duplicateKey = crypto.randomUUID();
const beforeDuplicate = await userA.supabase.from("practice_attempts").select("id", { count: "exact" }).eq("topic_progress_id", currentProgress.id);
const duplicateOne = await submitSeededAttempt({ supabase: userA.supabase, userId: userA.userId, subjectName: seed.subject.name, topicName: seed.topic.name, learnerSubjectId: a.learnerSubject.id, progressId: currentProgress.id, topicId: seed.topic.id, currentMastery: currentProgress.mastery, currentDifficulty: currentProgress.difficulty, attemptedCount: currentProgress.attempted_count, correctCount: currentProgress.correct_count, questions: seed.questions, answerCorrectly: true, submissionKey: duplicateKey });
const duplicateTwo = await submitSeededAttempt({ supabase: userA.supabase, userId: userA.userId, subjectName: seed.subject.name, topicName: seed.topic.name, learnerSubjectId: a.learnerSubject.id, progressId: currentProgress.id, topicId: seed.topic.id, currentMastery: currentProgress.mastery, currentDifficulty: currentProgress.difficulty, attemptedCount: currentProgress.attempted_count, correctCount: currentProgress.correct_count, questions: seed.questions, answerCorrectly: true, submissionKey: duplicateKey });
const afterDuplicate = await userA.supabase.from("practice_attempts").select("id", { count: "exact" }).eq("topic_progress_id", currentProgress.id);
if (!duplicateOne.persisted.inserted || duplicateTwo.persisted.inserted || (afterDuplicate.count ?? 0) !== (beforeDuplicate.count ?? 0) + 1) fail("idempotency_duplicate_submission_failed");
ok("duplicate_submission_did_not_duplicate_evidence");

const bProgressBefore = b.progress;
const crossUser = await userA.supabase.rpc("persist_practice_result", {
  p_submission_key: crypto.randomUUID(),
  p_learner_subject_id: b.learnerSubject.id,
  p_topic_progress_id: bProgressBefore.id,
  p_topic_id: seed.topic.id,
  p_concept_name: "Factorisation",
  p_difficulty: 2,
  p_question_snapshot: { prompt: "blocked" },
  p_expected_answer: { accepted: ["blocked"] },
  p_learner_answer: { value: "blocked" },
  p_is_correct: true,
  p_response_time_ms: 1,
  p_misconception_key: null,
  p_misconception_category: null,
  p_misconception_status: null,
  p_misconception_occurrence_count: null,
  p_misconception_evidence_summary: null,
  p_subject_name_snapshot: seed.subject.name,
  p_topic_name_snapshot: seed.topic.name,
  p_learning_session_id: null,
  p_mastery: 1,
  p_recent_accuracy: 100,
  p_next_difficulty: 2,
  p_attempted_count: 1,
  p_correct_count: 1,
  p_consecutive_correct: 1,
  p_consecutive_incorrect: 0,
  p_recommended_intervention: "continue",
});
if (!crossUser.error) fail("cross_user_rpc_write_allowed");
ok("cross_user_rpc_write_blocked");

const wrongQuestion = seed.questions.find((question) => question.misconceptionKey === "sign-error-factorisation") ?? seed.questions[0];
if (!wrongQuestion.misconceptionKey) fail("wrong_question_missing_misconception_key");
let bProgress = b.progress;
for (let index = 0; index < 2; index += 1) {
  const result = await submitSeededAttempt({ supabase: userB.supabase, userId: userB.userId, subjectName: seed.subject.name, topicName: seed.topic.name, learnerSubjectId: b.learnerSubject.id, progressId: bProgress.id, topicId: seed.topic.id, currentMastery: bProgress.mastery, currentDifficulty: wrongQuestion.difficulty, attemptedCount: bProgress.attempted_count, correctCount: bProgress.correct_count, questions: [wrongQuestion], answerCorrectly: false, submissionKey: crypto.randomUUID() });
  const refreshed = await userB.supabase.from("topic_progress").select("*").eq("id", bProgress.id).single();
  if (refreshed.error || !refreshed.data) fail(`user_b_refresh_failed:${refreshed.error?.message ?? "missing"}`);
  bProgress = refreshed.data;
  if (!result.persisted.inserted) fail("user_b_fresh_wrong_submission_not_inserted");
}
const misconception = await userB.supabase.from("misconception_state").select("status,occurrence_count").eq("user_id", userB.userId).eq("topic_id", seed.topic.id).eq("concept_name", wrongQuestion.misconceptionKey).single();
if (misconception.error || misconception.data.status !== "recurring") fail(`misconception_not_recurring:${misconception.error?.message ?? misconception.data?.status ?? "missing"}`);
if (misconception.data.occurrence_count < 2) fail(`misconception_occurrence_count_not_incremented:${misconception.data.occurrence_count}`);
ok("repeated_misconception_became_recurring");

const ownAttempt = await userA.supabase.from("practice_attempts").select("id").eq("id", duplicateOne.persisted.attempt_id).single();
if (ownAttempt.error || !ownAttempt.data) fail(`own_attempt_select_failed:${ownAttempt.error?.message ?? "missing"}`);
const updateAttempt = await userA.supabase.from("practice_attempts").update({ response_time_ms: 2 } as never).eq("id", duplicateOne.persisted.attempt_id).select("id");
if (!updateAttempt.error && updateAttempt.data.length > 0) fail("practice_attempt_update_allowed");
const deleteAttempt = await userA.supabase.from("practice_attempts").delete().eq("id", duplicateOne.persisted.attempt_id).select("id");
if (!deleteAttempt.error && deleteAttempt.data.length > 0) fail("practice_attempt_delete_allowed");
ok("practice_attempt_append_only_verified");

const thread = await userA.supabase.from("tutor_threads").insert({ user_id: userA.userId, topic_progress_id: currentProgress.id, title: "Milestone 4 verification" }).select("id").single();
if (thread.error || !thread.data) fail(`thread_insert_failed:${thread.error?.message ?? "missing"}`);
const hidden = await userA.supabase.from("tutor_messages").insert({ user_id: userA.userId, thread_id: thread.data.id, role: "assistant", content: "Visible only.", metadata: { hidden_reasoning: "forbidden" } }).select("id");
if (!hidden.error) fail("hidden_reasoning_metadata_allowed");
ok("hidden_reasoning_metadata_rejected");
