import { describe, expect, it } from "vitest";
import { selectNextQuestion } from "@/domain/practice/select-next-question";
import type { PracticeQuestion } from "@/domain/practice/types";

const q = (id: string, difficulty: number): PracticeQuestion => ({
  id,
  topicId: "topic-1",
  conceptName: "Factorisation",
  difficulty,
  questionType: "multiple_choice",
  prompt: id,
  options: [{ id: "a", label: "A" }],
  expectedAnswer: { option_id: "a" },
  explanation: "Explanation",
  misconceptionKey: null,
  misconceptionCategory: null,
});

describe("selectNextQuestion", () => {
  it("chooses the closest difficulty", () => {
    expect(selectNextQuestion({ questions: [q("easy", 2), q("hard", 6)], targetDifficulty: 5 }).question?.id).toBe("hard");
  });

  it("avoids repeating the previous question when alternatives exist", () => {
    expect(selectNextQuestion({ questions: [q("same", 4), q("other", 4)], targetDifficulty: 4, previousQuestionId: "same" }).question?.id).toBe("other");
  });

  it("handles no available questions", () => {
    expect(selectNextQuestion({ questions: [], targetDifficulty: 4 })).toMatchObject({ question: null, reasonCode: "no_available_question" });
  });
});
