import { buildTutorContextText } from "@/domain/tutor/context";
import { boundedConversation } from "@/domain/tutor/history";
import { toTutorResponse, tutorResponseSchema } from "@/domain/tutor/schema";
import type { TutorContextInput, TutorConversationTurn, TutorResponse } from "@/domain/tutor/types";
import { getConfiguredAiProvider, type AiJsonProvider } from "./provider";
import { tutorSystemPrompt, tutorUserPrompt } from "./tutor-prompts";

export async function generateTutorResponse(input: {
  context: TutorContextInput;
  transcript: TutorConversationTurn[];
  message: string;
  provider?: AiJsonProvider | null;
}): Promise<TutorResponse | null> {
  const provider = input.provider ?? getConfiguredAiProvider();

  if (!provider) {
    return null;
  }

  const system = tutorSystemPrompt(buildTutorContextText(input.context));
  const bounded = boundedConversation(input.transcript);
  const attempts = [
    { prompt: tutorUserPrompt({ transcript: bounded, message: input.message }) },
    { prompt: tutorUserPrompt({ transcript: bounded, message: input.message, correction: true }) },
  ];

  for (const attempt of attempts) {
    try {
      const raw = await provider.generateJson({ system, prompt: attempt.prompt });
      const parsed = tutorResponseSchema.safeParse(raw);

      if (!parsed.success) {
        continue;
      }

      return toTutorResponse(parsed.data);
    } catch {
      continue;
    }
  }

  return null;
}