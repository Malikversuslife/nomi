import { NextResponse } from "next/server";
import { z } from "zod";

import { generateTutorResponse } from "@/server/ai/tutor";
import { buildTutorContext } from "@/server/tutor/context";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import type { TutorConversationTurn } from "@/domain/tutor/types";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  topicId: z.string().uuid().nullable().optional(),
  transcript: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(3000),
  })).max(12).default([]),
});

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const context = await buildTutorContext(authData.user.id, parsed.data.topicId ?? null);
    const transcript: TutorConversationTurn[] = parsed.data.transcript;
    const response = await generateTutorResponse({
      context: context.input,
      transcript,
      message: parsed.data.message,
    });

    if (!response) {
      return NextResponse.json({ ok: false, error: "ai_unavailable" }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      message: response.message,
      suggestedAction: response.suggestedAction,
      followUp: response.followUp ?? null,
      context: context.client,
    });
  } catch (error) {
    console.error("mobile_tutor_failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
