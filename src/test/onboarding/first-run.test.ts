import { describe, expect, it } from "vitest";
import {
  deriveOnboardingStatus,
  resolvePostAuthRoute,
} from "@/domain/onboarding/first-run";

describe("deriveOnboardingStatus", () => {
  it("treats a brand-new learner with no learner_subject as needs-onboarding", () => {
    expect(deriveOnboardingStatus(false)).toBe("needs-onboarding");
  });

  it("treats a learner with any learner_subject as set up", () => {
    expect(deriveOnboardingStatus(true)).toBe("complete");
  });
});

describe("resolvePostAuthRoute", () => {
  it("routes first-run learners into onboarding", () => {
    expect(resolvePostAuthRoute("needs-onboarding")).toBe("/onboarding");
  });

  it("routes returning learners to their home", () => {
    expect(resolvePostAuthRoute("complete")).toBe("/home");
  });
});