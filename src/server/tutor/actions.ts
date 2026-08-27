"use server";

import { z } from "zod";
import { generateTutorResponse } from "@/server/ai/tutor";
import { getConfiguredAiProvider } from "@/server/ai/provider";
import { requireUser } from "@/server/supabase/auth";
import type { TutorConversationTurn, TutorInitialData } from "@/domain/tutor/types";
import { buildTutorContext } from "./context";
import {
  appendTutorMessages,
  createTutorThread,
  getOwnedTutorThread,
  getRecentTutorThread,
  listTutorMessages,
  toMessageView,
} from "./persistence";
import type { TutorActionResult } from "./types";

const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  threadId: z.string().nullable().optional(),
});

export async function loadTutorInitialData(userId: string): Promise<TutorInitialData> {
  const context = await buildTutorContext(userId);
  const thread = await getRecentTutorThread(userId);

  if (!thread) {
    return { threadId: null, messages: [], context: context.client };
  }

  const messages = await listTutorMessages(thread.id, 12);

  return {
    threadId: thread.id,
    messages: messages.map(toMessageView),
    context: context.client,
  };
}

export async function sendTutorMessageAction(input: {
  message: string;
  threadId?: string | null;
}): Promise<TutorActionResult> {
  const parsed = sendMessageSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "failed" };
  }

  const user = await requireUser();
  const context = await buildTutorContext(user.id);

  try {
    let thread = parsed.data.threadId
      ? await getOwnedTutorThread(parsed.data.threadId, user.id)
      : null;
    thread ??= await getRecentTutorThread(user.id);
    thread ??= await (async () => {
      const id = await createTutorThread(user.id, context.title, context.topicProgressId);
      return { id, title: context.title };
    })();

    if (!getConfiguredAiProvider()) {
      return { ok: false, error: "unavailable" };
    }

    const persisted = await listTutorMessages(thread.id, 12);
    const transcript: TutorConversationTurn[] = persisted.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

    const response = await generateTutorResponse({
      context: context.input,
      transcript,
      message: parsed.data.message,
    });

    if (!response) {
      return { ok: false, error: "failed" };
    }

    await appendTutorMessages(thread.id, user.id, [
      { role: "user", content: parsed.data.message },
      {
        role: "assistant",
        content: response.message,
        metadata: { suggested_action: response.suggestedAction, follow_up: response.followUp ?? null },
      },
    ]);

    const updated = await listTutorMessages(thread.id, 12);

    return {
      ok: true,
      messages: updated.map(toMessageView),
      context: context.client,
      threadId: thread.id,
    };
  } catch {
    return { ok: false, error: "failed" };
  }
}