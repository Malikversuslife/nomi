import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sanitizeNextPath } from "@/server/auth/redirects";
import { resolvePostAuthDestination } from "@/server/onboarding/status";
import { createServerSupabaseClient } from "@/server/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["email", "recovery", "invite", "magiclink", "email_change"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const defaultDestination = rawType === "recovery" ? "/auth/update-password" : "/home";
  const requestedDestination = sanitizeNextPath(request.nextUrl.searchParams.get("next"), defaultDestination);

  if (tokenHash && rawType && allowedTypes.has(rawType)) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({ type: rawType, token_hash: tokenHash });
    if (!error && data.user) {
      const destination = requestedDestination === "/home" ? await resolvePostAuthDestination(data.user.id) : requestedDestination;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/sign-in?error=auth_callback", request.url));
}
