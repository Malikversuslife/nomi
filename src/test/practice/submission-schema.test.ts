import { describe, expect, it } from "vitest";
import { practiceSubmissionSchema } from "@/server/practice/schemas";

describe("practiceSubmissionSchema", () => {
  it("accepts learner-controlled submission fields", () => {
    expect(practiceSubmissionSchema.safeParse({
      questionId: "00000000-0000-4000-8000-000000000001",
      learnerAnswer: { option_id: "a" },
      submissionKey: "00000000-0000-4000-8000-000000000002",
      responseTimeMs: 1200,
    }).success).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(practiceSubmissionSchema.safeParse({ questionId: "bad", learnerAnswer: "", submissionKey: "bad" }).success).toBe(false);
  });

  it("does not accept client-supplied correctness or user identity as validated output", () => {
    const result = practiceSubmissionSchema.parse({
      questionId: "00000000-0000-4000-8000-000000000001",
      learnerAnswer: { option_id: "a" },
      submissionKey: "00000000-0000-4000-8000-000000000002",
      user_id: "00000000-0000-4000-8000-000000000003",
      is_correct: true,
    });

    expect("user_id" in result).toBe(false);
    expect("is_correct" in result).toBe(false);
  });
});
