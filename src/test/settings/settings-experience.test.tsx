// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
vi.mock("server-only", () => ({}));

import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SettingsExperience } from "@/components/settings/settings-experience";
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
      activeSubjects: 1,
      activeSubjectNames: ["Mathematics"],
      topicsTouched: 2,
      questionsAnswered: 8,
      lastPracticedLabel: "Yesterday",
      recentTopics: [],
    },
    hasPracticeEvidence: true,
    ...overrides,
  };
}

describe("SettingsExperience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
  });

  it("renders the learning preferences form as the editing home", () => {
    render(<SettingsExperience data={sampleData()} />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How Nomi teaches you" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred name")).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText("Grade or year")).toHaveValue("Year 9");
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("shows account details read-only and a sign out control", () => {
    render(<SettingsExperience data={sampleData()} />);

    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Managed by your sign-in provider."),
    ).toBeInTheDocument();
    expect(screen.getByText("Member since")).toBeInTheDocument();
    expect(screen.getByText("September 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("offers light, dark, and system appearance choices", () => {
    render(<SettingsExperience data={sampleData()} />);

    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/Nomi follows your device's reduced-motion preference automatically/i),
    ).toBeInTheDocument();
  });

  it("applies and remembers dark mode immediately", () => {
    render(<SettingsExperience data={sampleData()} />);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("nomi-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
  });

  it("withholds features that have no real behaviour", () => {
    const { container } = render(<SettingsExperience data={sampleData()} />);
    const text = container.textContent ?? "";

    for (const withheld of [
      "Delete account",
      "Change email",
      "Notification toggles",
      "Email preferences",
      "Password",
    ]) {
      expect(text).not.toContain(withheld);
    }

    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
  });
});
