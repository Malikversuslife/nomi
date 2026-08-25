import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AiProviderError, OpenAiJsonProvider } from "@/server/ai/provider";

const config = {
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "test-model",
  NOMI_AI_TIMEOUT_MS: 1000,
  NOMI_AI_DISABLED: "false" as const,
};

describe("AI provider boundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }) }));

    await expect(new OpenAiJsonProvider(config).generateJson({ system: "s", prompt: "p" })).resolves.toEqual({ ok: true });
  });

  it("raises provider errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));

    await expect(new OpenAiJsonProvider(config).generateJson({ system: "s", prompt: "p" })).rejects.toBeInstanceOf(AiProviderError);
  });

  it("raises malformed JSON errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "not json" } }] }) }));

    await expect(new OpenAiJsonProvider(config).generateJson({ system: "s", prompt: "p" })).rejects.toBeInstanceOf(AiProviderError);
  });

  it("raises timeout/provider rejection errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("aborted")));

    await expect(new OpenAiJsonProvider(config).generateJson({ system: "s", prompt: "p", timeoutMs: 1 })).rejects.toBeInstanceOf(AiProviderError);
  });
});
