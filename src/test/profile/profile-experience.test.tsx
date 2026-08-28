// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileExperience } from "@/components/profile/profile-experience";
import type { ProfileExperienceData } from "@/domain/profile/types";

function sampleData(
  overrides: Partial<ProfileExperienceData> = {},
): ProfileExperienceData {
  return {
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    memberSinceLabel: "September 2025",
    preferences: {
      displayName: "Ada Lovelace",
      gradeYear: "Year 9",
      dailyGoalMinutes: 20,
      explanationStyle: "step-by-step",
    },
    summary: {
      activeSubjects: 2,
      activeSubjectNames: ["Mathematics", "Science"],
      topicsTouched: 3,
      questionsAnswered: 12,
      lastPracticedLabel: "Today",
      recentTopics: [
        { name: "Factorisation", lastPracticedLabel: "Today" },
        { name: "Decimals", lastPracticedLabel: "Yesterday" },
      ],
    },
    hasPracticeEvidence: true,
    ...overrides,
  };
}

describe("ProfileExperience", () => {
  it("renders identity, a quiet learning summary and recent topics", () => {
    render(<ProfileExperience data={sampleData()} />);

    expect(screen.getByRole("heading", { name: "Your profile" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Member since September 2025")).toBeInTheDocument();

    expect(screen.getByText("Recent learning")).toBeInTheDocument();
    expect(screen.getByText("You've practised 3 topics.")).toBeInTheDocument();
    expect(
      screen.getByText("12 questions answered · Last practised Today."),
    ).toBeInTheDocument();

    expect(screen.getByText("Factorisation")).toBeInTheDocument();
    expect(screen.getByText("Decimals")).toBeInTheDocument();
  });

  it("names the sole active subject in the narrative", () => {
    render(
      <ProfileExperience
        data={sampleData({
          summary: {
            activeSubjects: 1,
            activeSubjectNames: ["Mathematics"],
            topicsTouched: 1,
            questionsAnswered: 6,
            lastPracticedLabel: "Yesterday",
            recentTopics: [],
          },
        })}
      />,
    );

    expect(
      screen.getByText("You've practised 1 topic in Mathematics."),
    ).toBeInTheDocument();
  });

  it("shows a read-only learning preferences summary with an edit link", () => {
    render(<ProfileExperience data={sampleData()} />);

    expect(
      screen.getByRole("heading", { name: "Learning preferences" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Grade or year")).toBeInTheDocument();
    expect(screen.getByText("Year 9")).toBeInTheDocument();
    expect(screen.getByText("Daily practice goal")).toBeInTheDocument();
    expect(screen.getByText("20 minutes a day")).toBeInTheDocument();
    expect(screen.getByText("Explanation style")).toBeInTheDocument();
    expect(screen.getByText("Step by step")).toBeInTheDocument();

    const edit = screen.getByRole("link", { name: "Edit preferences" });
    expect(edit).toHaveAttribute("href", "/settings");
  });

  it("does not expose editing controls on the profile page", () => {
    render(<ProfileExperience data={sampleData()} />);

    expect(screen.queryByLabelText("Preferred name")).toBeNull();
    expect(screen.queryByLabelText("Explanation style")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
  });

  it("uses a calm 'Not set' value for unset preferences", () => {
    render(
      <ProfileExperience
        data={sampleData({
          preferences: {
            displayName: "Ada Lovelace",
            gradeYear: null,
            dailyGoalMinutes: 20,
            explanationStyle: null,
          },
        })}
      />,
    );

    expect(screen.getAllByText("Not set")).toHaveLength(2);
  });

  it("shows the not-yet-practised state truthfully", () => {
    render(
      <ProfileExperience
        data={sampleData({
          summary: {
            activeSubjects: 0,
            activeSubjectNames: [],
            topicsTouched: 0,
            questionsAnswered: 0,
            lastPracticedLabel: null,
            recentTopics: [],
          },
          hasPracticeEvidence: false,
        })}
      />,
    );

    expect(screen.getByText("You haven't started a topic yet.")).toBeInTheDocument();
    expect(screen.getByText("No questions answered yet.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Complete a practice session and your recent topics will appear here.",
      ),
    ).toBeInTheDocument();
  });

  it("stays low-key: no KPI card language", () => {
    const { container } = render(<ProfileExperience data={sampleData()} />);
    const text = container.textContent ?? "";

    for (const gone of [
      "At a glance",
      "Active subjects",
      "Topics practised",
      "Not yet",
    ]) {
      expect(text).not.toContain(gone);
    }
  });

  it("does not leak internal ids or engine detail", () => {
    const { container } = render(<ProfileExperience data={sampleData()} />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );

    for (const internal of [
      "preferred_explanation_style",
      "daily_goal_minutes",
      "recommended_intervention",
      "topic_progress",
      "learner_subjects",
    ]) {
      expect(text).not.toContain(internal);
    }
  });
});