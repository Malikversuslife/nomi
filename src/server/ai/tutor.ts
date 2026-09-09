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
    console.error("tutor_ai_unavailable", { reason: "provider_not_configured" });
    return null;
  }

  const system = tutorSystemPrompt(buildTutorContextText(input.context));
  const bounded = boundedConversation(input.transcript);
  const attempts = [
    { prompt: tutorUserPrompt({ transcript: bounded, message: input.message }) },
    { prompt: tutorUserPrompt({ transcript: bounded, message: input.message, correction: true }) },
  ];

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    try {
      const raw = await provider.generateJson({ system, prompt: attempt.prompt });
      const parsed = tutorResponseSchema.safeParse(raw);

      if (!parsed.success) {
        console.error("tutor_ai_unavailable", {
          reason: "schema_validation_failed",
          attempt: index + 1,
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
        });
        continue;
      }

      return toTutorResponse(parsed.data);
    } catch (error) {
      console.error("tutor_ai_unavailable", {
        reason: "provider_error",
        attempt: index + 1,
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
  }

  return null;
}
