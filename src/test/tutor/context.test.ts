import { describe, expect, it } from "vitest";
import {
  buildTutorContextText,
  emptyStateContextLine,
  interventionContextPhrase,
  misconceptionContextPhrase,
  tutorContextChip,
} from "@/domain/tutor/context";

describe("tutorContextChip", () => {
  it("combines subject and topic when both exist", () => {
    expect(
      tutorContextChip({ subjectName: "Mathematics", topicName: "Factorisation" }),
    ).toBe("Mathematics · Factorisation");
  });

  it("falls back to topic or subject alone", () => {
    expect(tutorContextChip({ subjectName: null, topicName: "Factorisation" })).toBe("Factorisation");
    expect(tutorContextChip({ subjectName: "Physics", topicName: null })).toBe("Physics");
  });

  it("returns null without any context", () => {
    expect(tutorContextChip({ subjectName: null, topicName: null })).toBeNull();
  });
});

describe("emptyStateContextLine", () => {
  it("returns a short topic-aware line only when a topic exists", () => {
    expect(emptyStateContextLine({ subjectName: "Mathematics", topicName: "Factorisation" })).toBe(
      "Want to go through it together?",
    );
    expect(emptyStateContextLine({ subjectName: null, topicName: null })).toBeNull();
  });
});

describe("interventionContextPhrase", () => {
  it("maps known interventions to learner-safe phrasing", () => {
    expect(interventionContextPhrase("retry")).toContain("another try");
    expect(interventionContextPhrase("simplify")).toContain("simpler");
    expect(interventionContextPhrase("continue")).toBe("recent progress has been steady");
  });

  it("returns null for unknown or absent interventions", () => {
    expect(interventionContextPhrase("mystery-code")).toBeNull();
    expect(interventionContextPhrase(null)).toBeNull();
  });
});

describe("misconceptionContextPhrase", () => {
  it("only surfaces active or recurring misconceptions", () => {
    expect(misconceptionContextPhrase("calculation_error", "active")).toContain("calculation step");
    expect(misconceptionContextPhrase("calculation_error", "recurring")).toContain("calculation step");
    expect(misconceptionContextPhrase("calculation_error", "resolved")).toBeNull();
    expect(misconceptionContextPhrase("calculation_error", null)).toBeNull();
  });

  it("returns null for unknown categories", () => {
    expect(misconceptionContextPhrase("something_else", "active")).toBeNull();
  });
});

describe("buildTutorContextText", () => {
  it("includes only the real evidence provided", () => {
    const text = buildTutorContextText({
      subjectName: "Mathematics",
      topicName: "Factorisation",
      gradeYear: "Year 9",
      explanationStyle: "step-by-step",
      intervention: "retry",
      misconceptionCategory: "calculation_error",
      misconceptionStatus: "active",
      recentPracticeCorrect: false,
    });

    expect(text).toContain("Subject: Mathematics");
    expect(text).toContain("Topic: Factorisation");
    expect(text).toContain("Learner grade/year: Year 9");
    expect(text).toContain("Preferred explanation style: step-by-step");
    expect(text).toContain("another try at it is recommended");
    expect(text).toContain("last answer was marked incorrect");
    expect(text).toContain("involves a calculation step");
  });

  it("omits absent fields without inventing claims", () => {
    const text = buildTutorContextText({});

    expect(text).not.toContain("Subject:");
    expect(text).not.toContain("misconception");
    expect(text).not.toContain("mastery");
    expect(text).toBe("");
  });
});