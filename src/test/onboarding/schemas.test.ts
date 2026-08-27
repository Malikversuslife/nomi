import { describe, expect, it } from "vitest";
import { onboardingSubmissionSchema } from "@/domain/onboarding/schemas";

describe("onboardingSubmissionSchema", () => {
  it("accepts canonical slugs and both destinations", () => {
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "mathematics",
        destination: "practice",
      }).success,
    ).toBe(true);
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "physics",
        destination: "learn",
      }).success,
    ).toBe(true);
  });

  it("rejects destinations outside the allowed set", () => {
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "mathematics",
        destination: "home",
      }).success,
    ).toBe(false);
  });

  it("rejects empty or malformed subject slugs", () => {
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "",
        destination: "practice",
      }).success,
    ).toBe(false);
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "Mathematics",
        destination: "practice",
      }).success,
    ).toBe(false);
    expect(
      onboardingSubmissionSchema.safeParse({
        subjectSlug: "mathematics!",
        destination: "practice",
      }).success,
    ).toBe(false);
  });
});