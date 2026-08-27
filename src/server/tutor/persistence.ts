import "server-only";
import { createServerSupabaseClient } from "@/server/supabase/server";
import type { Json, TutorMessage } from "@/server/supabase/types";
import type { TutorMessageView, TutorSuggestedAction } from "@/domain/tutor/types";

const suggestedActions = new Set<TutorSuggestedAction>(["practice", "review", "example", "none"]);

export type PersistedTutorMessage = TutorMessage;

function messageMetadata(row: PersistedTutorMessage): Record<string, unknown> {
  if (!row.metadata || typeof row.metadata !== "object" || Array.isArray(row.metadata)) {
    return {};
  }
  return row.metadata as Record<string, unknown>;
}

export function toMessageView(row: PersistedTutorMessage): TutorMessageView {
  const metadata = messageMetadata(row);
  const rawAction = typeof metadata.suggested_action === "string" ? metadata.suggested_action : null;
  const suggestedAction =
    rawAction && suggestedActions.has(rawAction as TutorSuggestedAction)
      ? (rawAction as TutorSuggestedAction)
      : null;
  const followUp = typeof metadata.follow_up === "string" && metadata.follow_up.trim() ? metadata.follow_up : null;

  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    suggestedAction,
    followUp,
  };
}

export async function getRecentTutorThread(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tutor_threads")
    .select("id,title")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load tutor thread: ${error.message}`);
  }

  return data;
}

export async function getOwnedTutorThread(threadId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tutor_threads")
    .select("id,title")
    .eq("id", threadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load tutor thread: ${error.message}`);
  }

  return data;
}

export async function createTutorThread(
  userId: string,
  title: string,
  topicProgressId: string | null,
): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tutor_threads")
    .insert({
      user_id: userId,
      title,
      topic_progress_id: topicProgressId ?? null,
      learning_session_id: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Unable to create tutor thread: ${error?.message ?? "unknown error"}`);
  }

  return data.id;
}

export async function appendTutorMessages(
  threadId: string,
  userId: string,
  rows: { role: "user" | "assistant"; content: string; metadata?: Json }[],
) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tutor_messages").insert(
    rows.map((row) => ({
      thread_id: threadId,
      user_id: userId,
      role: row.role,
      content: row.content,
      metadata: row.metadata ?? {},
    })),
  );

  if (error) {
    throw new Error(`Unable to save tutor messages: ${error.message}`);
  }
}

export async function listTutorMessages(
  threadId: string,
  limit: number = 12,
): Promise<PersistedTutorMessage[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tutor_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load tutor messages: ${error.message}`);
  }

  return (data ?? []).reverse();
}