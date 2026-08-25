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

  for (const prompt of prompts) {
    try {
      const raw = await provider.generateJson({ system: "You generate concise, validated Nomi practice content only.", prompt });
      const parsed = aiGeneratedQuestionSchema.safeParse(raw);

      if (!parsed.success || !validateTopicIntegrity({ generated: parsed.data, topicId: input.topicId, topicName: input.topicName, targetDifficulty: input.targetDifficulty })) {
        continue;
      }

      return {
        question: toPracticeQuestion({ id: crypto.randomUUID(), topicId: input.topicId, targetDifficulty: input.targetDifficulty, generated: parsed.data }),
        hint: parsed.data.hint,
        source: "ai_generated",
      };
    } catch {
      continue;
    }
  }

  return null;
}
