import { describe, expect, it } from "vitest";
import { toTutorResponse, tutorResponseSchema } from "@/domain/tutor/schema";

describe("tutorResponseSchema", () => {
  it("accepts a minimal valid response and defaults suggested_action to none", () => {
    const parsed = tutorResponseSchema.safeParse({ message: "Let's break this down." });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.suggested_action).toBe("none");
      expect(parsed.data.follow_up).toBeUndefined();
    }
  });

  it("accepts a fuller response with follow-up and suggested action", () => {
    const parsed = tutorResponseSchema.safeParse({
      message: "You are very close.",
      follow_up: "What do you think the first step is?",
      suggested_action: "practice",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.suggested_action).toBe("practice");
      expect(parsed.data.follow_up).toBe("What do you think the first step is?");
    }
  });

  it("rejects hidden reasoning keys", () => {
    expect(tutorResponseSchema.safeParse({ message: "ok", chain_of_thought: "..." }).success).toBe(false);
    expect(tutorResponseSchema.safeParse({ message: "ok", hidden_reasoning: "..." }).success).toBe(false);
    expect(tutorResponseSchema.safeParse({ message: "ok", reasoning: "..." }).success).toBe(false);
  });

  it("rejects learner-system keys the AI must never return", () => {
    for (const key of ["mastery", "difficulty", "intervention", "lifecycle_status", "topic_id", "user_id", "concept_name"]) {
      expect(tutorResponseSchema.safeParse({ message: "ok", [key]: 1 }).success).toBe(false);
    }
  });

  it("rejects unknown extra keys via strict parsing", () => {
    expect(tutorResponseSchema.safeParse({ message: "ok", surprise: "field" }).success).toBe(false);
  });

  it("rejects blank, missing, or oversized messages", () => {
    expect(tutorResponseSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(tutorResponseSchema.safeParse({}).success).toBe(false);
    expect(tutorResponseSchema.safeParse({ message: "x".repeat(2001) }).success).toBe(false);
  });

  it("rejects invalid suggested_action values", () => {
    expect(
      tutorResponseSchema.safeParse({ message: "ok", suggested_action: "grade_me" }).success,
    ).toBe(false);
  });

  it("maps a validated response to the domain TutorResponse", () => {
    const output = toTutorResponse({ message: "Hi", follow_up: "?", suggested_action: "review" });
    expect(output).toEqual({ message: "Hi", followUp: "?", suggestedAction: "review" });
  });
});