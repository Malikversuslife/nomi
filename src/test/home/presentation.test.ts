import { describe, expect, it } from "vitest";
import { deriveHomeViews, mapHomeIntervention, readHomeRecord } from "@/domain/home/presentation";

function iso(year: number, month: number, day: number, hours: number): string {
  return new Date(year, month, day, hours).toISOString();
}

describe("readHomeRecord", () => {
  it("reads the real topics.name field, not a fabricated topic_name", () => {
    const record = {
      last_practiced_at: "2026-08-28T08:00:00Z",
      topics: [{ name: "Factorisation", topic_name: "Bogus" }],
      recommended_intervention: "reinforce",
    };

    const parsed = readHomeRecord(record);

    expect(parsed?.topicName).toBe("Factorisation");
    expect(parsed?.lastPracticedAt).toBe("2026-08-28T08:00:00Z");
    expect(parsed?.recommendedIntervention).toBe("reinforce");
  });

  it("handles a single-object topics join", () => {
    expect(readHomeRecord({ topics: { name: "Decimals" } })?.topicName).toBe("Decimals");
  });

  it("is null-safe for empty records", () => {
    expect(readHomeRecord(null)).toBeNull();
    expect(readHomeRecord("not-an-object")).toBeNull();
    expect(readHomeRecord({})).toEqual({
      lastPracticedAt: null,
      topicName: null,
      recommendedIntervention: null,
    });
  });
});

describe("deriveHomeViews", () => {
  it("derives recent learning from persisted timestamps", () => {
    const now = new Date(2026, 7, 28, 12, 0);
    const views = deriveHomeViews(
      [
        {
          last_practiced_at: iso(2026, 7, 27, 9),
          topics: [{ name: "Factorisation" }],
          recommended_intervention: "reinforce",
        },
        {
          last_practiced_at: iso(2026, 7, 28, 9),
          topics: [{ name: "Decimals" }],
          recommended_intervention: null,
        },
      ],
      now,
    );

    expect(views.recentTopicNames).toEqual(["Decimals", "Factorisation"]);
    expect(views.recentLearning[0]).toEqual({
      topic: "Decimals",
      lastPracticedLabel: "Today",
    });
    expect(views.recentLearning[1]).toEqual({
      topic: "Factorisation",
      lastPracticedLabel: "Yesterday",
    });
  });

  it("maps the persisted intervention to a learner-safe recommendation", () => {
    const now = new Date(2026, 7, 28, 12, 0);
    const views = deriveHomeViews(
      [
        {
          last_practiced_at: iso(2026, 7, 28, 9),
          topics: [{ name: "Factorisation" }],
          recommended_intervention: "guided_practice",
        },
      ],
      now,
    );

    expect(views.recommendation).toEqual({
      intervention: "worked_example",
      topicName: "Factorisation",
    });
  });

  it("has no recommendation without practice evidence", () => {
    const now = new Date(2026, 7, 28, 12, 0);
    const views = deriveHomeViews([], now);

    expect(views.recentTopicNames).toEqual([]);
    expect(views.recentLearning).toEqual([]);
    expect(views.recommendation).toBeNull();
  });

  it("deduplicates repeated mentions of the same topic", () => {
    const now = new Date(2026, 7, 28, 12, 0);
    const views = deriveHomeViews(
      [
        {
          last_practiced_at: iso(2026, 7, 28, 9),
          topics: [{ name: "Factorisation" }],
          recommended_intervention: null,
        },
        {
          last_practiced_at: iso(2026, 7, 27, 9),
          topics: [{ name: "Factorisation" }],
          recommended_intervention: null,
        },
        {
          last_practiced_at: iso(2026, 7, 26, 9),
          topics: [{ name: "Ratio" }],
          recommended_intervention: null,
        },
      ],
      now,
    );

    expect(views.recentTopicNames).toEqual(["Factorisation", "Ratio"]);
    expect(views.recentLearning).toHaveLength(2);
  });

  it("ignores records without a real topic name", () => {
    const now = new Date(2026, 7, 28, 12, 0);
    const views = deriveHomeViews(
      [
        {
          last_practiced_at: iso(2026, 7, 28, 9),
          topics: [{ topic_name: "Bogus" }],
          recommended_intervention: null,
        },
      ],
      now,
    );

    expect(views.recentTopicNames).toEqual([]);
    expect(views.recentLearning).toEqual([]);
  });
});

describe("mapHomeIntervention", () => {
  it("maps known persisted interventions", () => {
    expect(mapHomeIntervention("reinforce")).toBe("reinforce");
    expect(mapHomeIntervention("review")).toBe("review_prerequisite");
    expect(mapHomeIntervention("remediation")).toBe("simplify");
    expect(mapHomeIntervention("guided_practice")).toBe("worked_example");
    expect(mapHomeIntervention("challenge")).toBe("increase_challenge");
    expect(mapHomeIntervention("standard_practice")).toBe("continue");
  });

  it("yields undefined for unset or unknown values", () => {
    expect(mapHomeIntervention(null)).toBeUndefined();
    expect(mapHomeIntervention(undefined)).toBeUndefined();
    expect(mapHomeIntervention("mystery")).toBeUndefined();
  });
});