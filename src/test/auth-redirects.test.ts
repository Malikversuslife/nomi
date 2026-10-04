import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "@/server/auth/redirects";

describe("auth return routes", () => {
  it("preserves an internal path and query string", () => {
    expect(sanitizeNextPath("/practice?topic=factorisation")).toBe("/practice?topic=factorisation");
  });

  it("rejects external and auth-loop destinations", () => {
    expect(sanitizeNextPath("https://example.com")).toBe("/home");
    expect(sanitizeNextPath("//example.com")).toBe("/home");
    expect(sanitizeNextPath("/auth/sign-in")).toBe("/home");
  });
});
