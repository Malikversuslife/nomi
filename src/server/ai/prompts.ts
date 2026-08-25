import type { InterventionType } from "@/domain/adaptive/types";

export const difficultyScale = `1-2 foundational recognition/basic single-step; 3-4 straightforward application; 5-6 multi-step standard grade-level; 7-8 demanding transfer/application; 9-10 advanced challenge.`;

export function questionGenerationPrompt(input: {
  subjectName: string;
  topicId: string;
  topicName: string;
  conceptName?: string | null;
  targetDifficulty: number;
  intervention: InterventionType | string;
  gradeYear?: string | null;
  explanationStyle?: string | null;
  recentSummary: string;
}) {
  return [
    "Generate one practice question for Nomi as strict JSON only.",
    `Subject: ${input.subjectName}`,
    `Authoritative topic_id: ${input.topicId}`,
    `Authoritative topic_name: ${input.topicName}`,
    `Concept/subskill hint: ${input.conceptName ?? "choose a subskill within the authoritative topic"}`,
    `Target difficulty: ${input.targetDifficulty}. Scale: ${difficultyScale}`,
    `Intervention: ${input.intervention}`,
    `Learner grade/year: ${input.gradeYear ?? "unknown"}`,
    `Preferred explanation style: ${input.explanationStyle ?? "concise"}`,
    `Recent learner-state summary: ${input.recentSummary}`,
    "Do not change topic_id, topic_name, learner difficulty, mastery, or intervention.",
    "Supported question_type values: multiple_choice or short_answer. For multiple_choice, correct_answer must be exactly one option id.",
    "Return keys only: question_type, prompt, options, correct_answer, accepted_answers, hint, explanation, concept_name, topic_id, topic_name, difficulty, misconception_candidates.",
    "Do not include hidden reasoning, chain_of_thought, raw metadata, markdown, or prose outside JSON.",
  ].join("\n");
}

export function misconceptionClassificationPrompt(input: {
  subjectName: string;
  topicName: string;
  conceptName: string;
  questionPrompt: string;
  correctAnswer: string;
  learnerAnswer: string;
  candidateKeys: string[];
}) {
  return [
    "Classify the likely misconception as strict JSON only.",
    `Subject: ${input.subjectName}`,
    `Authoritative topic: ${input.topicName}`,
    `Concept: ${input.conceptName}`,
    `Question: ${input.questionPrompt}`,
    `Correct answer: ${input.correctAnswer}`,
    `Learner answer: ${input.learnerAnswer}`,
    `Known candidate misconception keys: ${input.candidateKeys.join(", ") || "none"}`,
    "Approved categories: conceptual_understanding, calculation_error, terminology_confusion, skipped_step, careless_mistake, missing_prerequisite, unknown.",
    "Return keys only: category, misconception_key, concept_name, confidence, evidence_summary.",
    "The evidence_summary must be one concise learning signal. Do not decide lifecycle status and do not include hidden reasoning.",
  ].join("\n");
}
