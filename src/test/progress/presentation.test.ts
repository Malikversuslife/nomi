import { describe, expect, it } from "vitest";
import type { LearnTopicProgress } from "@/domain/learn/topic-state";
import {
  buildNextUp,
  countOverview,
  deriveTopicViews,
  filterToProgressedTopics,
  mapRecentLearning,
  relativeWhenLabel,
  sortTopicViews,
  summarizeSubjectProgress,
  type ProgressTopicEvidence,
} from "@/domain/progress/presentation";

function progress(overrides: Partial<LearnTopicProgress> = {}): LearnTopicProgress {
  return {
    mastery: 40,
    recentAccuracy: 70,
    attemptedCount: 1,
    consecutiveIncorrect: 0,
    ...overrides,
  };
}

function evidence(
  overrides: Partial<ProgressTopicEvidence> = {},
): ProgressTopicEvidence {
  return {
    topicId: "topic-1",
    subjectId: "subject-1",
    slug: "factorisation",
    name: "Factorisation",
    parentName: null,
    subjectName: "Mathematics",
    progress: null,
    lastPracticedAt: null,
    ...overrides,
  };
}

describe("deriveTopicViews + sortTopicViews", () => {
  it("derives learner-safe states from progress evidence", () => {
    const views = deriveTopicViews([
      evidence({ slug: "strong", name: "Fractions", progress: progress({ mastery: 85, recentAccuracy: 92 }) }),
      evidence({ slug: "needy", name: "Ratio", progress: progress({ consecutiveIncorrect: 2 }) }),
      evidence({ slug: "fresh", name: "Algebra", progress: null }),
      evidence({ slug: "started", name: "Decimals", progress: progress({ attemptedCount: 2 }) }),
    ]);

    const bySlug = new Map(views.map((view) => [view.slug, view]));
    expect(bySlug.get("strong")?.state.key).toBe("strong");
    expect(bySlug.get("needy")?.state.key).toBe("needs-practice");
    expect(bySlug.get("fresh")?.state.key).toBe("not-started");
    expect(bySlug.get("started")?.state.key).toBe("in-progress");
  });

  it("sorts by state priority with needs-practice first", () => {
    const sorted = sortTopicViews(
      deriveTopicViews([
        evidence({ slug: "fresh", name: "Algebra", progress: null }),
        evidence({ slug: "started", name: "Decimals", progress: progress({ attemptedCount: 2 }) }),
        evidence({ slug: "needy", name: "Ratio", progress: progress({ consecutiveIncorrect: 2 }) }),
        evidence({ slug: "strong", name: "Fractions", progress: progress({ mastery: 85 }) }),
      ]),
    );

    expect(sorted.map((view) => view.state.key)).toEqual([
      "needs-practice",
      "in-progress",
      "strong",
      "not-started",
    ]);
  });
});

describe("filterToProgressedTopics", () => {
  it("keeps only topics with real learner progress", () => {
    const filtered = filterToProgressedTopics(
      deriveTopicViews([
        evidence({ slug: "needy", name: "Ratio", progress: progress({ consecutiveIncorrect: 2 }) }),
        evidence({ slug: "started", name: "Decimals", progress: progress({ attemptedCount: 2 }) }),
        evidence({ slug: "strong", name: "Fractions", progress: progress({ mastery: 85 }) }),
        evidence({ slug: "fresh", name: "Algebra", progress: null }),
      ]),
    );

    expect(filtered.map((view) => view.state.key).sort()).toEqual([
      "in-progress",
      "needs-practice",
      "strong",
    ]);
  });

  it("returns an empty list when nothing has been started", () => {
    expect(
      filterToProgressedTopics(
        deriveTopicViews([evidence({ slug: "a", progress: null })]),
      ),
    ).toEqual([]);
  });
});

describe("countOverview", () => {
  it("counts the categories present in real state", () => {
    const overview = countOverview(
      deriveTopicViews([
        evidence({ slug: "a", progress: progress({ attemptedCount: 2 }) }),
        evidence({ slug: "b", progress: progress({ consecutiveIncorrect: 2 }) }),
        evidence({ slug: "c", progress: progress({ mastery: 85 }) }),
        evidence({ slug: "d", progress: null }),
      ]),
    );

    expect(overview).toEqual({ workingOn: 1, strong: 1, needsPractice: 1 });
  });

  it("returns null when no topic has started", () => {
    expect(
      countOverview(
        deriveTopicViews([
          evidence({ slug: "a", progress: null }),
          evidence({ slug: "b", progress: null }),
        ]),
      ),
    ).toBeNull();
  });
});

describe("summarizeSubjectProgress", () => {
  it("counts started, strong and needs-practice for a subject", () => {
    const subject = summarizeSubjectProgress(
      { slug: "mathematics", name: "Mathematics", iconKey: "calculator" },
      deriveTopicViews([
        evidence({ slug: "a", progress: progress({ mastery: 85 }) }),
        evidence({ slug: "b", progress: progress({ consecutiveIncorrect: 2 }) }),
        evidence({ slug: "c", progress: progress({ attemptedCount: 2 }) }),
        evidence({ slug: "d", progress: null }),
      ]),
    );

    expect(subject).toMatchObject({
      totalTopics: 4,
      started: 3,
      notStarted: 1,
      strong: 1,
      needsPractice: 1,
    });
  });

  it("reports zero activity honestly", () => {
    const subject = summarizeSubjectProgress(
      { slug: "science", name: "Science", iconKey: null },
      deriveTopicViews([
        evidence({ subjectId: "subject-2", slug: "a", progress: null }),
        evidence({ subjectId: "subject-2", slug: "b", progress: null }),
      ]),
    );

    expect(subject).toMatchObject({
      totalTopics: 2,
      started: 0,
      notStarted: 2,
      strong: 0,
      needsPractice: 0,
    });
  });
});

describe("buildNextUp", () => {
  it("uses learner-safe intervention copy for a needs-practice topic", () => {
    const views = deriveTopicViews([
      evidence({ slug: "a", name: "Factorisation", progress: progress({ consecutiveIncorrect: 2 }) }),
    ]);
    const nextUp = buildNextUp(
      views,
      new Map([["a", "review-prerequisite"]]),
    );

    expect(nextUp?.mascotKey).toBe("supportive");
    expect(nextUp?.message).toContain("Factorisation");
    expect(nextUp?.message.toLowerCase()).not.toContain("review-prerequisite");
  });

  it("falls back to plain copy when there is no intervention", () => {
    const nextUp = buildNextUp(
      deriveTopicViews([evidence({ slug: "a", name: "Ratio", progress: progress({ consecutiveIncorrect: 2 }) })]),
      new Map(),
    );

    expect(nextUp?.message).toBe("Ratio needs a little more practice.");
  });

  it("encourages continuing an in-progress topic", () => {
    const nextUp = buildNextUp(
      deriveTopicViews([evidence({ slug: "a", name: "Decimals", progress: progress({ attemptedCount: 2 }) })]),
      new Map(),
    );

    expect(nextUp?.mascotKey).toBe("encouraging");
    expect(nextUp?.message).toContain("building confidence with Decimals");
  });

  it("celebrates a strong topic", () => {
    const nextUp = buildNextUp(
      deriveTopicViews([evidence({ slug: "a", name: "Fractions", progress: progress({ mastery: 85, recentAccuracy: 92 }) })]),
      new Map(),
    );

    expect(nextUp?.mascotKey).toBe("celebrating");
    expect(nextUp?.message).toContain("doing well with Fractions");
  });

  it("returns null with no meaningful topic", () => {
    expect(buildNextUp([], new Map())).toBeNull();
    expect(
      buildNextUp(
        deriveTopicViews([evidence({ slug: "a", name: "Algebra", progress: null })]),
        new Map(),
      ),
    ).toBeNull();
  });

  it("never leaks raw intervention codes into recommendation copy", () => {
    const codes = [
      "retry",
      "hint",
      "simplify",
      "worked-example",
      "review-prerequisite",
      "increase-challenge",
      "reinforce",
      "continue",
    ];
    const nextUp = buildNextUp(
      deriveTopicViews([evidence({ slug: "a", name: "Factorisation", progress: progress({ consecutiveIncorrect: 2 }) })]),
      new Map([["a", "worked-example"]]),
    );

    for (const code of codes) {
      expect(nextUp?.message.toLowerCase()).not.toContain(code);
    }
  });
});

describe("relativeWhenLabel", () => {
  const now = new Date("2026-08-27T10:00:00Z");
  const iso = (offsetDays: number, hour = 9) =>
    new Date(Date.UTC(2026, 7, 27 - offsetDays, hour, 0, 0)).toISOString();

  it("labels today", () => {
    expect(relativeWhenLabel(iso(0), now)).toBe("Today");
  });

  it("labels yesterday", () => {
    expect(relativeWhenLabel(iso(1), now)).toBe("Yesterday");
  });

  it("labels recent days", () => {
    expect(relativeWhenLabel(iso(3), now)).toBe("3 days ago");
  });

  it("formats older dates without engine detail", () => {
    expect(relativeWhenLabel(iso(30), now)).toBe("28 Jul");
  });

  it("handles invalid input gracefully", () => {
    expect(relativeWhenLabel("not-a-date", now)).toBe("");
  });
});

describe("mapRecentLearning", () => {
  const now = new Date("2026-08-27T10:00:00Z");
  const createdAt = new Date("2026-08-27T09:00:00Z").toISOString();

  it("maps attempts to reflection-friendly items", () => {
    const items = mapRecentLearning(
      [
        { topicNameSnapshot: "Factorisation", conceptName: "Expand (x+3)(x+2)", isCorrect: true, createdAt },
        { topicNameSnapshot: "Factorisation", conceptName: "Expand (x+3)(x+2)", isCorrect: false, createdAt },
      ],
      now,
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ kind: "correct", topicName: "Factorisation", whenLabel: "Today" });
    expect(items[1]).toMatchObject({ kind: "incorrect", topicName: "Factorisation", whenLabel: "Today" });
    expect(items[0].key).not.toBe(items[1].key);
  });

  it("skips attempts with unresolved correctness", () => {
    const items = mapRecentLearning(
      [{ topicNameSnapshot: "Factorisation", conceptName: "x", isCorrect: null, createdAt }],
      now,
    );
    expect(items).toHaveLength(0);
  });

  it("keeps only the latest meaningful attempts", () => {
    const items = mapRecentLearning(
      Array.from({ length: 5 }, (_, index) => ({
        topicNameSnapshot: `Topic ${index}`,
        conceptName: "x",
        isCorrect: true,
        createdAt,
      })),
      now,
    );

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.topicName)).not.toContain("Topic 3");
    expect(items.map((item) => item.topicName)).not.toContain("Topic 4");
  });

  it("skips rows with no usable context", () => {
    const items = mapRecentLearning(
      [{ topicNameSnapshot: null, conceptName: null, isCorrect: true, createdAt }],
      now,
    );
    expect(items).toHaveLength(0);
  });

  it("falls back to a friendly label when the topic snapshot is missing", () => {
    const items = mapRecentLearning(
      [{ topicNameSnapshot: null, conceptName: "Something", isCorrect: true, createdAt }],
      now,
    );
    expect(items[0].topicName).toBe("Recent practice");
  });

  it("never exposes timestamps or submission keys", () => {
    const items = mapRecentLearning(
      [{ topicNameSnapshot: "Factorisation", conceptName: "x", isCorrect: true, createdAt }],
      now,
    );
    const text = items.map((item) => `${item.topicName} ${item.conceptName} ${item.whenLabel}`).join(" ");
    expect(text).not.toContain(createdAt);
    expect(text).not.toMatch(/submission/i);
  });
});