const FALLBACK_SITE_URL = "http://localhost:3000";

export function sanitizeNextPath(value: FormDataEntryValue | string | null | undefined, fallback = "/home") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value.startsWith("/auth/") ? fallback : value;
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/\/$/, "")}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment.replace(/\/$/, "")}`;
  return FALLBACK_SITE_URL;
}

export function getAuthCallbackUrl(next: string) {
  const callback = new URL("/auth/callback", getSiteUrl());
  callback.searchParams.set("next", sanitizeNextPath(next));
  return callback.toString();
}
