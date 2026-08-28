import { describe, expect, it } from "vitest";
import {
  answeredSentence,
  buildProfileSummary,
  explanationStyleLabel,
  goalLabel,
  memberSinceLabel,
  practisedSentence,
} from "@/domain/profile/presentation";

function iso(year: number, month: number, day: number, hours: number): string {
  return new Date(year, month, day, hours).toISOString();
}

describe("buildProfileSummary", () => {
  it("counts active subjects and aggregates practice evidence truthfully", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [
          { status: "active" },
          { status: "active" },
          { status: "paused" },
          { status: "archived" },
        ],
        topicProgress: [
          { attemptedCount: 0, lastPracticedAt: null, topicName: null },
          {
            attemptedCount: 2,
            lastPracticedAt: iso(2026, 7, 27, 10),
            topicName: "Decimals",
          },
          {
            attemptedCount: 5,
            lastPracticedAt: iso(2026, 7, 28, 9),
            topicName: "Factorisation",
          },
        ],
      },
      now,
    );

    expect(summary.activeSubjects).toBe(2);
    expect(summary.topicsTouched).toBe(3);
    expect(summary.questionsAnswered).toBe(7);
    expect(summary.lastPracticedLabel).toBe("Today");
    expect(summary.recentTopics.map((topic) => topic.name)).toEqual([
      "Factorisation",
      "Decimals",
    ]);
  });

  it("collects the names of active subjects only", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [
          { status: "active", name: "Mathematics" },
          { status: "active", name: "Science" },
          { status: "paused", name: "English" },
          { status: "archived", name: "History" },
        ],
        topicProgress: [],
      },
      now,
    );

    expect(summary.activeSubjects).toBe(2);
    expect(summary.activeSubjectNames).toEqual(["Mathematics", "Science"]);
  });

  it("ignores subject rows without a real name", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [
          { status: "active", name: null },
          { status: "active", name: undefined },
          { status: "active", name: "Art" },
        ],
        topicProgress: [],
      },
      now,
    );

    expect(summary.activeSubjectNames).toEqual(["Art"]);
  });

  it("returns an empty-safe summary when nothing has been practised", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [],
        topicProgress: [{ attemptedCount: 0, lastPracticedAt: null, topicName: null }],
      },
      now,
    );

    expect(summary.activeSubjects).toBe(0);
    expect(summary.topicsTouched).toBe(1);
    expect(summary.questionsAnswered).toBe(0);
    expect(summary.lastPracticedLabel).toBeNull();
    expect(summary.recentTopics).toEqual([]);
  });

  it("orders recent topics by most recently practised and caps the list", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [],
        topicProgress: [
          {
            attemptedCount: 1,
            lastPracticedAt: iso(2026, 7, 27, 10),
            topicName: "Older",
          },
          {
            attemptedCount: 1,
            lastPracticedAt: iso(2026, 7, 28, 9),
            topicName: "Newest",
          },
          {
            attemptedCount: 1,
            lastPracticedAt: iso(2026, 7, 26, 9),
            topicName: "Oldest",
          },
          {
            attemptedCount: 1,
            lastPracticedAt: iso(2026, 7, 25, 9),
            topicName: "Fourth",
          },
          {
            attemptedCount: 1,
            lastPracticedAt: iso(2026, 7, 24, 9),
            topicName: "Fifth",
          },
        ],
      },
      now,
    );

    expect(summary.recentTopics.map((topic) => topic.name)).toEqual([
      "Newest",
      "Older",
      "Oldest",
      "Fourth",
    ]);
  });

  it("skips work without a real topic name", () => {
    const now = new Date(2026, 7, 28, 12, 0);

    const summary = buildProfileSummary(
      {
        learnerSubjects: [],
        topicProgress: [
          {
            attemptedCount: 3,
            lastPracticedAt: iso(2026, 7, 28, 9),
            topicName: null,
          },
        ],
      },
      now,
    );

    expect(summary.questionsAnswered).toBe(3);
    expect(summary.lastPracticedLabel).toBeNull();
    expect(summary.recentTopics).toEqual([]);
  });
});

describe("memberSinceLabel", () => {
  it("formats a full month and year", () => {
    expect(memberSinceLabel("2026-09-05T00:00:00Z")).toBe("September 2026");
    expect(memberSinceLabel("2025-01-10T00:00:00Z")).toBe("January 2025");
  });

  it("returns null for missing or invalid timestamps", () => {
    expect(memberSinceLabel(null)).toBeNull();
    expect(memberSinceLabel("not-a-date")).toBeNull();
  });
});

describe("goalLabel", () => {
  it("handles singular and plural minutes", () => {
    expect(goalLabel(1)).toBe("1 minute a day");
    expect(goalLabel(20)).toBe("20 minutes a day");
  });
});

describe("explanationStyleLabel", () => {
  it("maps known styles to learner-facing labels", () => {
    expect(explanationStyleLabel("step-by-step")).toBe("Step by step");
    expect(explanationStyleLabel("conceptual")).toBe("Big picture first");
    expect(explanationStyleLabel("examples-first")).toBe("Start with examples");
    expect(explanationStyleLabel("concise")).toBe("Keep it short");
  });

  it("returns null for unset or unknown values", () => {
    expect(explanationStyleLabel(null)).toBeNull();
    expect(explanationStyleLabel("")).toBeNull();
    expect(explanationStyleLabel("fancy")).toBeNull();
  });
});

describe("practisedSentence", () => {
  it("names a single active subject", () => {
    const summary = {
      activeSubjects: 1,
      activeSubjectNames: ["Mathematics"],
      topicsTouched: 1,
      questionsAnswered: 6,
      lastPracticedLabel: "Yesterday",
      recentTopics: [],
    };

    expect(practisedSentence(summary)).toBe("You've practised 1 topic in Mathematics.");
  });

  it("omits the subject name when several subjects are active", () => {
    const summary = {
      activeSubjects: 2,
      activeSubjectNames: ["Mathematics", "Science"],
      topicsTouched: 3,
      questionsAnswered: 12,
      lastPracticedLabel: "Today",
      recentTopics: [],
    };

    expect(practisedSentence(summary)).toBe("You've practised 3 topics.");
  });

  it("pluralises the topic noun", () => {
    const summary = {
      activeSubjects: 1,
      activeSubjectNames: ["Mathematics"],
      topicsTouched: 2,
      questionsAnswered: 4,
      lastPracticedLabel: null,
      recentTopics: [],
    };

    expect(practisedSentence(summary)).toBe("You've practised 2 topics in Mathematics.");
  });

  it("describes a learner who has not started yet", () => {
    const summary = {
      activeSubjects: 0,
      activeSubjectNames: [],
      topicsTouched: 0,
      questionsAnswered: 0,
      lastPracticedLabel: null,
      recentTopics: [],
    };

    expect(practisedSentence(summary)).toBe("You haven't started a topic yet.");
  });
});

describe("answeredSentence", () => {
  it("combines answered count with the last practised time", () => {
    const summary = {
      activeSubjects: 1,
      activeSubjectNames: ["Mathematics"],
      topicsTouched: 2,
      questionsAnswered: 6,
      lastPracticedLabel: "Yesterday",
      recentTopics: [],
    };

    expect(answeredSentence(summary)).toBe(
      "6 questions answered · Last practised Yesterday.",
    );
  });

  it("pluralises the question noun", () => {
    const summary = {
      activeSubjects: 0,
      activeSubjectNames: [],
      topicsTouched: 1,
      questionsAnswered: 1,
      lastPracticedLabel: null,
      recentTopics: [],
    };

    expect(answeredSentence(summary)).toBe("1 question answered.");
  });

  it("is truthful when nothing has been answered", () => {
    const summary = {
      activeSubjects: 0,
      activeSubjectNames: [],
      topicsTouched: 0,
      questionsAnswered: 0,
      lastPracticedLabel: null,
      recentTopics: [],
    };

    expect(answeredSentence(summary)).toBe("No questions answered yet.");
  });
});