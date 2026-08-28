// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfilePreferencesForm } from "@/components/profile/profile-preferences-form";
import type { ProfilePreferences } from "@/domain/profile/types";
import type { ProfileSettingsActionState } from "@/server/profile/schemas";

function samplePreferences(
  overrides: Partial<ProfilePreferences> = {},
): ProfilePreferences {
  return {
    displayName: "Ada",
    gradeYear: null,
    dailyGoalMinutes: 20,
    explanationStyle: null,
    ...overrides,
  };
}

function successAction(): Promise<ProfileSettingsActionState> {
  return Promise.resolve({ success: true });
}

describe("ProfilePreferencesForm", () => {
  it("pre-fills the current preferences", () => {
    render(
      <ProfilePreferencesForm
        preferences={samplePreferences({
          gradeYear: "Year 9",
          explanationStyle: "concise",
        })}
        action={successAction}
      />,
    );

    expect(screen.getByLabelText("Preferred name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Grade or year")).toHaveValue("Year 9");
    expect(screen.getByLabelText("Daily practice goal")).toHaveValue(20);
    expect(screen.getByLabelText("Explanation style")).toHaveValue("concise");
  });

  it("defaults the explanation style to letting Nomi choose", () => {
    render(
      <ProfilePreferencesForm preferences={samplePreferences()} action={successAction} />,
    );

    expect(screen.getByLabelText("Explanation style")).toHaveValue("");
  });

  it("shows field errors returned from the action", async () => {
    const failingAction = (): Promise<ProfileSettingsActionState> =>
      Promise.resolve({
        fieldErrors: { displayName: ["Use at least 2 characters."] },
      });

    render(
      <ProfilePreferencesForm preferences={samplePreferences()} action={failingAction} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Use at least 2 characters."),
    ).toBeInTheDocument();
  });

  it("shows a saved confirmation after a successful save", async () => {
    render(
      <ProfilePreferencesForm preferences={samplePreferences()} action={successAction} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(screen.getByText("Your details are up to date.")).toBeInTheDocument();
  });

  it("surfaces a message-level failure from the action", async () => {
    const failedAction = (): Promise<ProfileSettingsActionState> =>
      Promise.resolve({ message: "We couldn't save your changes. Please try again." });

    render(
      <ProfilePreferencesForm preferences={samplePreferences()} action={failedAction} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("We couldn't save your changes. Please try again."),
    ).toBeInTheDocument();
  });
});