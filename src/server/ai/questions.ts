import type { InterventionType } from "@/domain/adaptive/types";
import type { PracticeQuestion } from "@/domain/practice/types";
import type { AiJsonProvider } from "./provider";
import { getConfiguredAiProvider } from "./provider";
import { questionGenerationPrompt } from "./prompts";
import { aiGeneratedQuestionSchema, toPracticeQuestion, validateTopicIntegrity } from "./schemas";

export type GeneratedPracticeQuestion = {
  question: PracticeQuestion;
  hint: string;
  source: "ai_generated";
};

function safeErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return "unknown error";
  }

  if (error instanceof Error) {
    // Strip anything that looks like a key/secret/token from the message
    let msg = error.message;
    // Remove potential API key patterns, bearer tokens, etc.
    msg = msg.replace(/[a-zA-Z0-9]{20,}/g, "***REDACTED***");
    msg = msg.replace(/ Bearer [a-zA-Z0-9._-]+/g, "Bearer ***REDACTED***");
    return msg.trim();
  }

  if (typeof error === "string") {
    return error.length > 100 ? error.substring(0, 100) + "..." : error;
  }

  return "unknown error";
}

export async function generatePracticeQuestion(
  input: {
    subjectName: string;
    topicId: string;
    topicName: string;
    conceptName?: string | null;
    targetDifficulty: number;
    intervention: InterventionType | string;
    gradeYear?: string | null;
    explanationStyle?: string | null;
    recentSummary: string;
  },
  provider: AiJsonProvider | null = getConfiguredAiProvider(),
): Promise<GeneratedPracticeQuestion | null> {
  if (!provider) {
    return null;
  }

  const basePrompt = questionGenerationPrompt(input);
  const prompts = [basePrompt, `${basePrompt}\nYour previous output failed validation. Correct it and return valid JSON only.`];

  for (let attempt = 1; attempt <= prompts.length; attempt++) {
    try {
      const raw = await provider.generateJson({ system: "You generate concise, validated Nomi practice content only.", prompt: prompts[attempt - 1] });
      const parsed = aiGeneratedQuestionSchema.safeParse(raw);

      if (!parsed.success || !validateTopicIntegrity({ generated: parsed.data, topicId: input.topicId, topicName: input.topicName, targetDifficulty: input.targetDifficulty })) {
        // On first attempt failure, log the error
        if (attempt === 1 && process.env.NODE_ENV !== "production") {
          const errorSummary = safeErrorMessage("validation failed");
          console.log(`[Nomi AI] question generation attempt ${attempt} failed: ${errorSummary}`);
        }
        continue;
      }

      return {
        question: toPracticeQuestion({ id: crypto.randomUUID(), topicId: input.topicId, targetDifficulty: input.targetDifficulty, generated: parsed.data }),
        hint: parsed.data.hint,
        source: "ai_generated",
      };
    } catch (error) {
      // On last attempt failure, log the error before falling back
      if (attempt === prompts.length) {
        const errorClass = error instanceof Error ? error.constructor.name : String(error).substring(0, 50);
        const errorMsg = safeErrorMessage(error);
        console.log(`[Nomi AI] question generation attempt ${attempt} failed: ${errorClass}: ${errorMsg}`);
      }
      continue;
    }
  }

  return null;
}
