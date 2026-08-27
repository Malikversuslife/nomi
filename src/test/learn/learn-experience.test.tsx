// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LearnExperience } from "@/components/learn/learn-experience";
import type { LearnExperienceData, LearnSubjectView } from "@/domain/learn/types";

const mathematics: LearnSubjectView = {
  slug: "mathematics",
  name: "Mathematics",
  description: "Patterns, numbers, algebra, and problem solving.",
  iconKey: "calculator",
  units: [
    {
      slug: "algebra",
      name: "Algebra",
      description: "Using symbols and structure to solve problems.",
      rows: [],
      groups: [
        {
          slug: "quadratic-equations",
          name: "Quadratic equations",
          rows: [
            {
              slug: "factorisation",
              name: "Factorisation",
              state: {
                key: "needs-practice",
                label: "Needs practice",
                cue: "A few recent answers went sideways.",
                actionLabel: "Practise again",
              },
              recommended: true,
            },
          ],
        },
      ],
    },
  ],
};

const physics: LearnSubjectView = {
  slug: "physics",
  name: "Physics",
  description: "How the universe moves.",
  iconKey: "atom",
  units: [
    {
      slug: "motion",
      name: "Motion",
      description: "How objects move.",
      rows: [
        {
          slug: "speed-and-velocity",
          name: "Speed and velocity",
          state: {
            key: "not-started",
            label: "Not started",
            cue: null,
            actionLabel: "Practise",
          },
          recommended: false,
        },
      ],
      groups: [],
    },
  ],
};

const continuing: LearnExperienceData = {
  subjects: [mathematics, physics],
  defaultSubjectSlug: "mathematics",
  continueView: {
    kind: "continue",
    subjectName: "Mathematics",
    parentName: "Quadratic equations",
    topicName: "Factorisation",
    state: {
      key: "needs-practice",
      label: "Needs practice",
      cue: "A few recent answers went sideways.",
      actionLabel: "Practise again",
    },
  },
  insightView: {
    topicName: "Factorisation",
    message: "Factorisation is worth another quick practice before moving on.",
  },
};

const starting: LearnExperienceData = {
  ...continuing,
  continueView: { kind: "start" },
  insightView: null,
};

describe("LearnExperience", () => {
  it("opens on the default subject and keeps the Nomi insight honest", () => {
    const { container } = render(<LearnExperience data={continuing} />);

    expect(screen.getByRole("heading", { name: "Mathematics" })).toBeInTheDocument();
    expect(screen.getAllByText("Factorisation").length).toBeGreaterThan(0);
    expect(screen.getByText("Nomi suggests")).toBeInTheDocument();
    expect(container.textContent).toContain(
      "Factorisation is worth another quick practice before moving on.",
    );
  });

  it("switches subjects from the selector", () => {
    render(<LearnExperience data={continuing} />);

    fireEvent.click(screen.getByRole("button", { name: "Physics" }));

    expect(screen.getByRole("heading", { name: "Physics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Motion" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Algebra" })).not.toBeInTheDocument();
  });

  it("shows a start state instead of a recommendation when there is no progress", () => {
    const { container } = render(<LearnExperience data={starting} />);

    expect(screen.getByText("You're ready to start.")).toBeInTheDocument();
    expect(
      screen.getByText("Choose a topic and Nomi will begin adapting as you practise."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nomi suggests")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("Continue practice");
  });

  it("never leaks UUIDs or raw internal codes into the DOM", () => {
    const { container } = render(<LearnExperience data={continuing} />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );

    for (const internal of [
      "needs-practice",
      "worked-example",
      "review-prerequisite",
      "increase-challenge",
      "recommended_intervention",
      "consecutive_incorrect",
      "recent_accuracy",
      "attempted_count",
      "mastery",
    ]) {
      expect(text).not.toContain(internal);
    }
  });
});