import type { NomiMascotState } from "@/components/nomi/nomi-mascot";

export type GuidanceKind = "hint" | "worked-example" | "simplify";

export type PracticeGuidance = {
  kind: GuidanceKind;
  text: string;
};

export type FeedbackCopy = {
  title: string;
  message: string;
};

export const guidanceHeading: Record<GuidanceKind, string> = {
  hint: "Here's a clue",
  "worked-example": "Let's work through it",
  simplify: "Here's a simpler way",
};

type ResultSummary = {
  correct: boolean;
  intervention?: string | null;
  explanation?: string;
  hint?: string | null;
  consecutiveCorrect?: number;
  difficultyChange?: number;
};

const correctMessages: Record<string, string> = {
  continue: "You got it right.",
  reinforce: "You got it right. Let's do one more like this to make sure the pattern sticks.",
  "increase-challenge": "You got it right — you're ready for something tougher.",
  "worked-example": "You got it right. Let's lock it in by working through one together.",
  simplify: "You got it right. Let's try a simpler take so it really sticks.",
  "review-prerequisite": "You got it right. Let's revisit one idea that will make this easier.",
  hint: "You got it right.",
  retry: "You got it right.",
};

const incorrectMessages: Record<string, string> = {
  continue: "Give it another go.",
  reinforce: "Give it another go.",
  "increase-challenge": "Give it another go.",
  retry: "Give it another go.",
  hint: "Let me give you a clue to work with.",
  "worked-example": "Let's work through this one together.",
  simplify: "Let's try a simpler version of this.",
  "review-prerequisite": "This builds on an earlier idea. Revisit that, then come back to this.",
};

export function feedbackCopy(result: ResultSummary): FeedbackCopy {
  const table = result.correct ? correctMessages : incorrectMessages;
  const message =
    table[result.intervention ?? "continue"] ??
    (result.correct ? correctMessages.continue : incorrectMessages.continue);
  return { title: result.correct ? "Nice work." : "Not quite.", message };
}

export function guidanceForResult(result: ResultSummary): PracticeGuidance | null {
  if (result.intervention === "hint") {
    const text = result.hint || result.explanation || "";
    return text ? { kind: "hint", text } : null;
  }

  if (result.intervention === "worked-example" || result.intervention === "simplify") {
    const text = result.explanation || "";
    const kind: GuidanceKind = result.intervention === "worked-example" ? "worked-example" : "simplify";
    return text ? { kind, text } : null;
  }

  return null;
}

export function reactionForResult(result: ResultSummary): NomiMascotState {
  if (result.correct) {
    if (result.intervention === "increase-challenge" && (result.difficultyChange ?? 0) > 0) {
      return "challenge";
    }
    if ((result.consecutiveCorrect ?? 0) >= 3) {
      return "celebrating";
    }
    return "encouraging";
  }

  if (result.intervention === "hint") {
    return "thinking";
  }
  if (result.intervention === "worked-example" || result.intervention === "reinforce") {
    return "reinforcing";
  }
  return "supportive";
}