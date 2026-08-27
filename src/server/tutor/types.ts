import type { TutorClientContext, TutorMessageView } from "@/domain/tutor/types";

export type TutorActionResult =
  | { ok: true; messages: TutorMessageView[]; context: TutorClientContext; threadId: string }
  | { ok: false; error: "unavailable" | "failed" };