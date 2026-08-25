"use server";

import { submitPracticeAttempt } from "./submit";
import { practiceSubmissionSchema } from "./schemas";
import type { PracticeActionState } from "./types";

export async function submitPracticeAttemptAction(_state: PracticeActionState, formData: FormData): Promise<PracticeActionState> {
  const rawAnswer = formData.get("learnerAnswer");
  const questionType = formData.get("questionType");
  const parsed = practiceSubmissionSchema.safeParse({
    questionId: formData.get("questionId"),
    submissionKey: formData.get("submissionKey"),
    learningSessionId: formData.get("learningSessionId") || null,
    responseTimeMs: formData.get("responseTimeMs") || null,
    learnerAnswer: questionType === "multiple_choice" ? { option_id: rawAnswer } : { value: rawAnswer },
  });

  if (!parsed.success) {
    return { message: "Check your answer and try again." };
  }

  try {
    const result = await submitPracticeAttempt(parsed.data);

    return {
      result,
      question: result.nextQuestion,
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Unable to submit practice attempt." };
  }
}
