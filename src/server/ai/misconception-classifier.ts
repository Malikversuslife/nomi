import type { Json } from "@/server/supabase/types";
import type { AiJsonProvider } from "./provider";
import { getConfiguredAiProvider } from "./provider";
import { misconceptionClassificationPrompt } from "./prompts";
import { misconceptionClassificationSchema, type MisconceptionClassification } from "./schemas";

function answerLabel(answer: Json | unknown) {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
    return String(answer ?? "");
  }

  const record = answer as Record<string, unknown>;

  if (typeof record.option_id === "string") {
    return record.option_id;
  }

  if (typeof record.value === "string") {
    return record.value;
  }

  if (Array.isArray(record.accepted)) {
    return record.accepted.filter((value): value is string => typeof value === "string").join(", ");
  }

  return "";
}

export async function classifyMisconception(
  input: {
    subjectName: string;
    topicName: string;
    conceptName: string;
    questionPrompt: string;
    correctAnswer: Json;
    learnerAnswer: Json;
    candidateKeys: string[];
  },
  provider: AiJsonProvider | null = getConfiguredAiProvider(),
): Promise<MisconceptionClassification | null> {
  if (!provider) {
    return null;
  }

  try {
    const raw = await provider.generateJson({
      system: "You classify concise learner misconceptions for Nomi. Never decide lifecycle status.",
      prompt: misconceptionClassificationPrompt({ ...input, correctAnswer: answerLabel(input.correctAnswer), learnerAnswer: answerLabel(input.learnerAnswer) }),
    });
    const parsed = misconceptionClassificationSchema.safeParse(raw);

    if (!parsed.success || parsed.data.confidence < 0.35) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}
