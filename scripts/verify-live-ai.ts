import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { deriveLearnerState } from "@/domain/adaptive/learner-state";
import { evaluateAnswer } from "@/domain/practice/evaluate-answer";
import { classifyMisconception } from "@/server/ai/misconception-classifier";
import { generatePracticeQuestion } from "@/server/ai/questions";
import { buildMisconceptionLifecycleInput, getMisconceptionIdentity } from "@/server/practice/misconceptions";
import type { Database, Json } from "@/server/supabase/types";

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

loadLocalEnv();

if (!process.env.OPENAI_API_KEY || process.env.NOMI_AI_DISABLED === "true") {
  console.log("live_ai=skipped:no_configured_provider");
  process.exit(0);
}

for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "TEST_USER_A_EMAIL", "TEST_USER_A_PASSWORD"]) {
  if (!process.env[key]) fail(`missing_env_${key}`);
}

const supabase = client();
const signedIn = await supabase.auth.signInWithPassword({ email: process.env.TEST_USER_A_EMAIL!, password: process.env.TEST_USER_A_PASSWORD! });
if (signedIn.error || !signedIn.data.user) fail(`signin_failed:${signedIn.error?.message ?? "missing"}`);
ok("live_ai_signin");

const subject = await supabase.from("subjects").select("*").eq("slug", "mathematics").single();
if (subject.error || !subject.data) fail(`subject_lookup_failed:${subject.error?.message ?? "missing"}`);
const topic = await supabase.from("topics").select("*").eq("slug", "factorisation").eq("subject_id", subject.data.id).single();
if (topic.error || !topic.data) fail(`topic_lookup_failed:${topic.error?.message ?? "missing"}`);
const learnerSubject = await supabase.from("learner_subjects").upsert({ user_id: signedIn.data.user.id, subject_id: subject.data.id, status: "active" }, { onConflict: "user_id,subject_id" }).select("*").single();
if (learnerSubject.error || !learnerSubject.data) fail(`learner_subject_failed:${learnerSubject.error?.message ?? "missing"}`);
const progress = await supabase.from("topic_progress").upsert({ user_id: signedIn.data.user.id, learner_subject_id: learnerSubject.data.id, topic_id: topic.data.id }, { onConflict: "user_id,topic_id" }).select("*").single();
if (progress.error || !progress.data) fail(`topic_progress_failed:${progress.error?.message ?? "missing"}`);

const targetDifficulty = progress.data.difficulty;
const generated = await generatePracticeQuestion({
  subjectName: subject.data.name,
  topicId: topic.data.id,
  topicName: topic.data.name,
  targetDifficulty,
  intervention: progress.data.recommended_intervention ?? "continue",
  recentSummary: `mastery ${progress.data.mastery}, recent accuracy ${progress.data.recent_accuracy}`,
});

if (!generated) fail("ai_generation_failed_or_invalid");
if (generated.question.topicId !== topic.data.id) fail("ai_topic_identity_changed");
if (generated.question.difficulty !== targetDifficulty) fail("ai_difficulty_changed");
if (!generated.question.explanation || !generated.hint) fail("ai_missing_hint_or_explanation");
ok("ai_question_generated_validated");

const wrongAnswer = generated.question.questionType === "multiple_choice" ? { option_id: "not-correct" } : { value: "not correct" };
const evaluation = evaluateAnswer(generated.question, wrongAnswer);
if (evaluation.isCorrect) fail("wrong_answer_evaluated_correct");

const classification = await classifyMisconception({
  subjectName: subject.data.name,
  topicName: topic.data.name,
  conceptName: generated.question.conceptName,
  questionPrompt: generated.question.prompt,
  correctAnswer: generated.question.expectedAnswer,
  learnerAnswer: evaluation.normalizedLearnerAnswer,
  candidateKeys: [generated.question.misconceptionKey].filter((key): key is string => Boolean(key)),
});
if (!classification) fail("ai_classification_failed_or_low_confidence");
ok("ai_misconception_classified");

const identity = getMisconceptionIdentity({ topicProgressId: progress.data.id, misconceptionKey: classification.misconception_key, misconceptionCategory: classification.category });
if (!identity) fail("classification_identity_missing");
const lifecycle = buildMisconceptionLifecycleInput({ identity, previous: null, currentAttempt: { isCorrect: false, difficulty: generated.question.difficulty, misconceptionKey: classification.misconception_key } });
const learnerState = deriveLearnerState({
  currentMastery: progress.data.mastery,
  currentDifficulty: progress.data.difficulty,
  attempts: lifecycle.attempts,
  misconceptionAttempts: lifecycle.attempts,
  misconceptionKey: classification.misconception_key,
  misconceptionOccurrenceCount: lifecycle.occurrenceCount,
});
if (!learnerState.misconceptionSummary) fail("deterministic_lifecycle_missing_classification");
ok("deterministic_lifecycle_received_classification");

const persisted = await supabase.rpc("persist_practice_result", {
  p_submission_key: crypto.randomUUID(),
  p_learner_subject_id: learnerSubject.data.id,
  p_topic_progress_id: progress.data.id,
  p_topic_id: topic.data.id,
  p_concept_name: generated.question.conceptName,
  p_difficulty: generated.question.difficulty,
  p_question_snapshot: { question_id: generated.question.id, prompt: generated.question.prompt, question_type: generated.question.questionType, options: generated.question.options, source: generated.source } as Json,
  p_expected_answer: generated.question.expectedAnswer,
  p_learner_answer: evaluation.normalizedLearnerAnswer,
  p_is_correct: false,
  p_response_time_ms: 1000,
  p_misconception_key: learnerState.misconceptionSummary.key,
  p_misconception_category: classification.category,
  p_misconception_status: learnerState.misconceptionSummary.status,
  p_misconception_occurrence_count: learnerState.misconceptionSummary.occurrenceCount,
  p_misconception_evidence_summary: classification.evidence_summary,
  p_subject_name_snapshot: subject.data.name,
  p_topic_name_snapshot: topic.data.name,
  p_learning_session_id: null,
  p_mastery: learnerState.mastery,
  p_recent_accuracy: learnerState.recentAccuracy.weightedAccuracyPercentage,
  p_next_difficulty: learnerState.difficulty,
  p_attempted_count: progress.data.attempted_count + 1,
  p_correct_count: progress.data.correct_count,
  p_consecutive_correct: learnerState.consecutiveCorrect,
  p_consecutive_incorrect: learnerState.consecutiveIncorrect,
  p_recommended_intervention: learnerState.recommendedIntervention.type,
});
if (persisted.error || !persisted.data?.[0]?.inserted) fail(`ai_attempt_persist_failed:${persisted.error?.message ?? "missing"}`);
ok("ai_practice_attempt_persisted");

const fallback = await generatePracticeQuestion({ subjectName: subject.data.name, topicId: topic.data.id, topicName: topic.data.name, targetDifficulty, intervention: "continue", recentSummary: "fallback check" }, null);
if (fallback !== null) fail("ai_disabled_fallback_not_null");
ok("ai_disabled_fallback_verified");
