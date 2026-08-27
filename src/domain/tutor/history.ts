import type { TutorConversationTurn } from "./types";

export const TUTOR_HISTORY_LIMIT = 10;

export function boundedConversation(
  turns: TutorConversationTurn[],
  maxMessages: number = TUTOR_HISTORY_LIMIT,
): TutorConversationTurn[] {
  const bounded = turns.slice(-maxMessages);
  return bounded.map((turn) => ({
    role: turn.role,
    content: turn.content.length > 600 ? `${turn.content.slice(0, 597)}...` : turn.content,
  }));
}

export function formatConversationForPrompt(turns: TutorConversationTurn[]): string {
  if (turns.length === 0) {
    return "(no prior messages)";
  }

  return turns
    .map((turn) => `${turn.role === "user" ? "Learner" : "Nomi"}: ${turn.content}`)
    .join("\n");
}