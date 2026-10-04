import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { resolvePostAuthDestination } from "@/server/onboarding/status";
import { sanitizeNextPath } from "@/server/auth/redirects";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedDestination = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const destination = requestedDestination === "/home" ? await resolvePostAuthDestination(data.user.id) : requestedDestination;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/auth/sign-in?error=auth_callback", request.url));
}
