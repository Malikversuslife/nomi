// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { LearningPath } from "@/components/learn/learning-path";
import type { LearnSubjectView } from "@/domain/learn/types";

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
            {
              slug: "completing-the-square",
              name: "Completing the square",
              state: {
                key: "not-started",
                label: "Not started",
                cue: null,
                actionLabel: "Practise",
              },
              recommended: false,
            },
          ],
        },
      ],
    },
  ],
};

describe("LearningPath", () => {
  it("renders units, groups, topics and learner-safe state labels", () => {
    const { container } = render(<LearningPath subject={mathematics} />);

    expect(
      screen.getByRole("heading", { name: "Algebra" },
    )).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Quadratic equations" },
    )).toBeInTheDocument();
    expect(screen.getByText("Factorisation")).toBeInTheDocument();
    expect(screen.getByText("Completing the square")).toBeInTheDocument();
    expect(screen.getByText("Needs practice")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
    expect(container.textContent).toContain("A few recent answers went sideways.");
  });

  it("does not duplicate the continue entry point inside topic rows", () => {
    render(<LearningPath subject={mathematics} />);
    expect(screen.queryByText("Continue here")).not.toBeInTheDocument();
  });

  it("renders practice actions with descriptive accessible labels", () => {
    render(<LearningPath subject={mathematics} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Practise again Factorisation" }),
    ).toHaveAttribute("href", "/practice");
    expect(
      screen.getByRole("link", { name: "Practise Completing the square" }),
    ).toHaveAttribute("href", "/practice");
  });

  it("does not leak UUIDs or raw internal codes into the DOM", () => {
    const { container } = render(<LearningPath subject={mathematics} />);
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
    ]) {
      expect(text).not.toContain(internal);
    }
  });

  it("shows a learner-safe state when a subject has no topics yet", () => {
    render(
      <LearningPath
        subject={{ ...mathematics, units: [] }}
      />,
    );
    expect(
      screen.getByText("Topics for this subject aren't available yet."),
    ).toBeInTheDocument();
  });
});