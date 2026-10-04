import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema, updatePasswordSchema } from "@/server/auth/schemas";

describe("auth schemas", () => {
  it("accepts valid sign-in input", () => {
    expect(signInSchema.safeParse({ email: "learner@example.com", password: "password123" }).success).toBe(true);
  });

  it("rejects invalid sign-up input", () => {
    const result = signUpSchema.safeParse({ displayName: "N", email: "not-email", password: "short" });

    expect(result.success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("requires matching passwords", () => {
    expect(updatePasswordSchema.safeParse({ password: "newpassword", confirmPassword: "different" }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ password: "newpassword", confirmPassword: "newpassword" }).success).toBe(true);
  });
});
