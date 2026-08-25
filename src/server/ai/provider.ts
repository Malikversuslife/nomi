import { z } from "zod";

export type AiJsonProvider = {
  generateJson(input: { system: string; prompt: string; timeoutMs?: number }): Promise<unknown>;
};

export class AiProviderError extends Error {}

const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  NOMI_AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(8000),
  NOMI_AI_DISABLED: z.enum(["true", "false"]).default("false"),
});

type OpenAiProviderConfig = z.infer<typeof aiEnvSchema>;

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new AiProviderError("AI provider returned malformed JSON.");
    }

    return JSON.parse(match[0]);
  }
}

export class OpenAiJsonProvider implements AiJsonProvider {
  constructor(private readonly config: OpenAiProviderConfig = aiEnvSchema.parse(process.env)) {}

  async generateJson(input: { system: string; prompt: string; timeoutMs?: number }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? this.config.NOMI_AI_TIMEOUT_MS);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.config.OPENAI_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.OPENAI_MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.prompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AiProviderError(`AI provider request failed with ${response.status}.`);
      }

      const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new AiProviderError("AI provider returned no content.");
      }

      return extractJson(content);
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }

      throw new AiProviderError(error instanceof Error ? error.message : "AI provider failed.");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getConfiguredAiProvider(): AiJsonProvider | null {
  const env = aiEnvSchema.parse(process.env);

  return env.NOMI_AI_DISABLED !== "true" && env.OPENAI_API_KEY ? new OpenAiJsonProvider(env) : null;
}
