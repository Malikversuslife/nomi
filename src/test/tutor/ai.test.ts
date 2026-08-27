import { describe, expect, it, vi } from "vitest";
import { generateTutorResponse } from "@/server/ai/tutor";
import type { AiJsonProvider } from "@/server/ai/provider";
import type { TutorContextInput } from "@/domain/tutor/types";

const context: TutorContextInput = {
  subjectName: "Mathematics",
  topicName: "Factorisation",
};

describe("generateTutorResponse", () => {
  it("returns null when no provider is available", async () => {
    await expect(generateTutorResponse({ context, transcript: [], message: "hi", provider: null })).resolves.toBeNull();
  });

  it("returns a mapped TutorResponse for valid output", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        message: "Think of a product.",
        suggested_action: "practice",
        follow_up: "What next?",
      })),
    } satisfies AiJsonProvider;

    const result = await generateTutorResponse({ context, transcript: [], message: "help", provider });

    expect(result).toEqual({
      message: "Think of a product.",
      followUp: "What next?",
      suggestedAction: "practice",
    });
  });

  it("treats missing suggested_action as none via schema defaults", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({ message: "ok" })),
    } satisfies AiJsonProvider;

    const result = await generateTutorResponse({ context, transcript: [], message: "help", provider });

    expect(result?.suggestedAction).toBe("none");
  });

  it("returns null when the provider throws", async () => {
    const provider = {
      generateJson: vi.fn(async () => {
        throw new Error("boom");
      }),
    } satisfies AiJsonProvider;

    await expect(generateTutorResponse({ context, transcript: [], message: "help", provider })).resolves.toBeNull();
  });

  it("returns null when the provider leaks forbidden learner-system keys", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({ message: "ok", mastery: 87 })),
    } satisfies AiJsonProvider;

    await expect(generateTutorResponse({ context, transcript: [], message: "help", provider })).resolves.toBeNull();
  });

  it("retries once with a correction and still returns null on invalid output", async () => {
    const generateJson = vi.fn(async () => ({}));
    const provider = { generateJson } satisfies AiJsonProvider;

    await expect(generateTutorResponse({ context, transcript: [], message: "help", provider })).resolves.toBeNull();
    expect(generateJson).toHaveBeenCalledTimes(2);
  });
});