// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressExperience } from "@/components/progress/progress-experience";
import type { ProgressExperienceData } from "@/domain/progress/types";

function sampleData(overrides: Partial<ProgressExperienceData> = {}): ProgressExperienceData {
  return {
    hasCurriculum: true,
    hasEvidence: true,
    overview: { workingOn: 1, strong: 1, needsPractice: 1 },
    subjects: [
      {
        slug: "mathematics",
        name: "Mathematics",
        iconKey: "calculator",
        totalTopics: 3,
        started: 2,
        notStarted: 1,
        strong: 1,
        needsPractice: 1,
      },
      {
        slug: "science",
        name: "Science",
        iconKey: "flask",
        totalTopics: 2,
        started: 0,
        notStarted: 2,
        strong: 0,
        needsPractice: 0,
      },
    ],
    topics: [
      {
        slug: "factorisation",
        name: "Factorisation",
        subjectName: "Mathematics",
        parentName: "Quadratic equations",
        state: {
          key: "needs-practice",
          label: "Needs practice",
          cue: "A few recent answers went sideways — one more go will settle the pattern.",
          actionLabel: "Practise again",
        },
        recentlyPractised: true,
      },
      {
        slug: "decimals",
        name: "Decimals",
        subjectName: "Mathematics",
        parentName: null,
        state: {
          key: "in-progress",
          label: "In progress",
          cue: "You've made a start.",
          actionLabel: "Practise",
        },
        recentlyPractised: true,
      },
      {
        slug: "fractions",
        name: "Fractions",
        subjectName: "Mathematics",
        parentName: null,
        state: {
          key: "strong",
          label: "Strong",
          cue: "You're in great shape here.",
          actionLabel: "Practise",
        },
        recentlyPractised: false,
      },
      {
        slug: "algebra",
        name: "Algebra",
        subjectName: "Mathematics",
        parentName: "Foundations",
        state: {
          key: "not-started",
          label: "Not started",
          cue: null,
          actionLabel: "Practise",
        },
        recentlyPractised: false,
      },
    ],
    nextUp: {
      topicName: "Factorisation",
      message: "Factorisation needs a little more practice.",
      mascotKey: "supportive",
    },
    recentLearning: [
      {
        key: "factorisation-expand-0",
        topicName: "Factorisation",
        conceptName: "Expand (x+3)(x+2)",
        kind: "incorrect",
        whenLabel: "Today",
      },
      {
        key: "factorisation-expand-1",
        topicName: "Factorisation",
        conceptName: "Expand (x+3)(x+2)",
        kind: "correct",
        whenLabel: "Yesterday",
      },
    ],
    ...overrides,
  };
}

function chipCountText(count: number, label: string) {
  return (_content: string, element: Element | null) =>
    element?.tagName.toLowerCase() === "p" &&
    (element.textContent?.trim() ?? "") === `${count} ${label}`;
}

describe("ProgressExperience", () => {
  it("shows the new-learner empty state with a practice CTA", () => {
    render(
      <ProgressExperience
        data={sampleData({
          hasEvidence: false,
          overview: null,
          topics: [],
          nextUp: null,
          recentLearning: [],
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Your progress starts here" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Complete a few practice questions and Nomi will start showing/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start practising" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(
      screen.queryByText("Your learning at a glance"),
    ).not.toBeInTheDocument();
  });

  it("renders the overview, subjects, topics, next up and recent learning", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(
      screen.getByRole("heading", { name: "See how you're growing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your learning at a glance" }),
    ).toBeInTheDocument();

    expect(screen.getByText(chipCountText(1, "Working on"))).toBeInTheDocument();
    expect(screen.getByText(chipCountText(1, "Strong"))).toBeInTheDocument();
    expect(screen.getByText(chipCountText(1, "Needs practice"))).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Your subjects" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Mathematics").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What you're working on" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Next up")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recent learning" }),
    ).toBeInTheDocument();
  });

  it("renders subject summary counts truthfully", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(screen.getByText("2 topics started")).toBeInTheDocument();
    expect(screen.getByText("1 strong")).toBeInTheDocument();
    expect(screen.getByText("1 topic needs practice")).toBeInTheDocument();
    expect(screen.getByText("Not started yet")).toBeInTheDocument();
  });

  it("renders each learner-safe topic state with an action", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(screen.getAllByText("Needs practice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getAllByText("Strong").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Not started")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Practise again Factorisation" }),
    ).toHaveAttribute("href", "/practice");
    expect(screen.getByRole("link", { name: "Practise Decimals" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(screen.getByRole("link", { name: "Practise Fractions" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(
      screen.queryByRole("link", { name: "Practise Algebra" }),
    ).not.toBeInTheDocument();
  });

  it("excludes untouched topics from the main progress list", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(screen.getAllByText("Factorisation").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Decimals")).toBeInTheDocument();
    expect(screen.getByText("Fractions")).toBeInTheDocument();
    expect(screen.queryByText("Algebra")).not.toBeInTheDocument();
    expect(screen.queryByText(/Foundations · Mathematics/)).not.toBeInTheDocument();
  });

  it("shows a focused placeholder instead of rows when no topic has evidence", () => {
    render(
      <ProgressExperience
        data={sampleData({
          overview: null,
          topics: [
            {
              slug: "algebra",
              name: "Algebra",
              subjectName: "Mathematics",
              parentName: "Foundations",
              state: {
                key: "not-started",
                label: "Not started",
                cue: null,
                actionLabel: "Practise",
              },
              recentlyPractised: false,
            },
          ],
          nextUp: null,
          recentLearning: [],
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "What you're working on" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Algebra")).not.toBeInTheDocument();
    expect(
      screen.getByText(/You haven't started any topics yet/),
    ).toBeInTheDocument();
  });

  it("shows topic context for the learner", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(screen.getByText("Quadratic equations · Mathematics")).toBeInTheDocument();
  });

  it("renders a recommendation with a mascot and CTA", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(
      screen.getByText("Factorisation needs a little more practice."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Practise" })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("renders recent learning with reflection-friendly labels", () => {
    render(<ProgressExperience data={sampleData()} />);

    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Keep going")).toBeInTheDocument();
    expect(screen.getAllByText("Expand (x+3)(x+2)")).toHaveLength(2);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("handles missing optional context gracefully", () => {
    render(
      <ProgressExperience
        data={sampleData({
          recentLearning: [
            {
              key: "no-concept",
              topicName: "Factorisation",
              conceptName: null,
              kind: "correct",
              whenLabel: "Today",
            },
          ],
          subjects: [
            {
              slug: "empty",
              name: "Empty subject",
              iconKey: null,
              totalTopics: 0,
              started: 0,
              notStarted: 0,
              strong: 0,
              needsPractice: 0,
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByText("Factorisation").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Topics for this subject aren't available yet."),
    ).toBeInTheDocument();
  });

  it("omits overview categories that have no data", () => {
    render(
      <ProgressExperience
        data={sampleData({
          overview: { workingOn: 2, strong: 0, needsPractice: 0 },
          subjects: [
            {
              slug: "mathematics",
              name: "Mathematics",
              iconKey: "calculator",
              totalTopics: 2,
              started: 2,
              notStarted: 0,
              strong: 0,
              needsPractice: 0,
            },
          ],
          topics: [
            {
              slug: "decimals",
              name: "Decimals",
              subjectName: "Mathematics",
              parentName: null,
              state: {
                key: "in-progress",
                label: "In progress",
                cue: "You've made a start.",
                actionLabel: "Practise",
              },
              recentlyPractised: true,
            },
            {
              slug: "ratio",
              name: "Ratio",
              subjectName: "Mathematics",
              parentName: null,
              state: {
                key: "in-progress",
                label: "In progress",
                cue: "You've made a start.",
                actionLabel: "Practise",
              },
              recentlyPractised: false,
            },
          ],
          nextUp: {
            topicName: "Decimals",
            message: "You're building confidence with Decimals. One more round could help it stick.",
            mascotKey: "encouraging",
          },
          recentLearning: [],
        })}
      />,
    );

    expect(screen.getByText(chipCountText(2, "Working on"))).toBeInTheDocument();
    expect(screen.queryByText("Strong")).not.toBeInTheDocument();
    expect(screen.queryByText("Needs practice")).not.toBeInTheDocument();
  });

  it("degrades gracefully when there is no curriculum", () => {
    render(
      <ProgressExperience
        data={sampleData({
          hasCurriculum: false,
          overview: null,
          subjects: [],
          topics: [],
          nextUp: null,
        })}
      />,
    );

    expect(
      screen.getByText("Learning content isn't ready yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recent learning" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your learning at a glance"),
    ).not.toBeInTheDocument();
  });

  it("does not leak internal ids, codes or engine detail", () => {
    const { container } = render(<ProgressExperience data={sampleData()} />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );

    for (const internal of [
      "needs-practice",
      "review-prerequisite",
      "worked-example",
      "increase-challenge",
      "reinforce",
      "recommended_intervention",
      "consecutive_incorrect",
      "recent_accuracy",
      "submission",
      "misconception",
      "mastery",
    ]) {
      expect(text.toLowerCase()).not.toContain(internal);
    }
  });

  it("uses semantic headings and keeps state in text, not colour alone", () => {
    const { container } = render(<ProgressExperience data={sampleData()} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("h2").length).toBeGreaterThanOrEqual(4);
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0);
  });
});