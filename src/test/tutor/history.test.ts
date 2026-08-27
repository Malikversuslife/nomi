import { describe, expect, it } from "vitest";
import { boundedConversation, formatConversationForPrompt, TUTOR_HISTORY_LIMIT } from "@/domain/tutor/history";
import type { TutorConversationTurn } from "@/domain/tutor/types";

const longText = "x".repeat(800);

describe("boundedConversation", () => {
  it("keeps all turns when under the limit and preserves order", () => {
    const turns: TutorConversationTurn[] = [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ];

    expect(boundedConversation(turns)).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
  });

  it("caps the transcript to the last N turns", () => {
    const turns = Array.from({ length: 20 }, (_, i) => ({
      role: ("assistant" as const),
      content: `turn-${i}`,
    }));

    const bounded = boundedConversation(turns);

    expect(bounded).toHaveLength(TUTOR_HISTORY_LIMIT);
    expect(bounded[0].content).toBe("turn-10");
    expect(bounded[bounded.length - 1].content).toBe("turn-19");
  });

  it("truncates very long messages and drops extras before truncation", () => {
    const turns: TutorConversationTurn[] = [
      { role: "user", content: longText },
      { role: "assistant", content: "short" },
    ];
    const bounded = boundedConversation(turns, 2);

    expect(bounded[0].content.length).toBe(600);
    expect(bounded[0].content.endsWith("...")).toBe(true);
    expect(bounded[1].content).toBe("short");
  });
});

describe("formatConversationForPrompt", () => {
  it("returns a placeholder for empty transcripts", () => {
    expect(formatConversationForPrompt([])).toBe("(no prior messages)");
  });

  it("labels speaker roles and joins turns", () => {
    const formatted = formatConversationForPrompt([
      { role: "user", content: "I'm stuck" },
      { role: "assistant", content: "Let's help" },
    ]);

    expect(formatted).toBe("Learner: I'm stuck\nNomi: Let's help");
  });
});