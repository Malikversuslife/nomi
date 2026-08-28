import { describe, expect, it } from "vitest";
import { profileSettingsSchema } from "@/server/profile/schemas";

function validInput() {
  return {
    displayName: "Ada Lovelace",
    gradeYear: "Year 9",
    dailyGoalMinutes: 20,
    explanationStyle: "step-by-step",
  };
}

describe("profileSettingsSchema", () => {
  it("accepts a complete valid profile", () => {
    const parsed = profileSettingsSchema.safeParse(validInput());
    expect(parsed.success).toBe(true);
  });

  it("normalises empty grade year and explanation style to null", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      gradeYear: "",
      explanationStyle: "",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatchObject({ gradeYear: null, explanationStyle: null });
  });

  it("coerces a numeric string goal into a number", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      dailyGoalMinutes: "30",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.dailyGoalMinutes).toBe(30);
  });

  it("trims the display name", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      displayName: "  Ada  ",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.displayName).toBe("Ada");
  });

  it("rejects a display name that is too short", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      displayName: "A",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.displayName).toBeDefined();
    }
  });

  it("rejects a display name that is too long", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      displayName: "a".repeat(81),
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects goals outside the supported 1-240 range", () => {
    for (const value of [0, -1, 241, 1.5]) {
      const parsed = profileSettingsSchema.safeParse({
        ...validInput(),
        dailyGoalMinutes: value,
      });
      expect(parsed.success).toBe(false);
    }
  });

  it("accepts the boundary goals", () => {
    expect(
      profileSettingsSchema.safeParse({ ...validInput(), dailyGoalMinutes: 1 }).success,
    ).toBe(true);
    expect(
      profileSettingsSchema.safeParse({ ...validInput(), dailyGoalMinutes: 240 }).success,
    ).toBe(true);
  });

  it("rejects a non-numeric goal", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      dailyGoalMinutes: "not-a-number",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown explanation style", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      explanationStyle: "fancy",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.explanationStyle).toBeDefined();
    }
  });

  it("rejects an overlong grade year", () => {
    const parsed = profileSettingsSchema.safeParse({
      ...validInput(),
      gradeYear: "y".repeat(41),
    });

    expect(parsed.success).toBe(false);
  });
});