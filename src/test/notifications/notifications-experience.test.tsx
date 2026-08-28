// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationsExperience } from "@/components/notifications/notifications-experience";

describe("NotificationsExperience", () => {
  it("shows a truthful empty state", () => {
    render(<NotificationsExperience />);

    expect(
      screen.getByRole("heading", { name: "You're all caught up" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nothing needs your attention right now/),
    ).toBeInTheDocument();
  });

  it("makes no claim that notifications are sent or delivered", () => {
    const { container } = render(<NotificationsExperience />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/delivered|emailed|sent you|disabled/i);
    expect(text.toLowerCase()).not.toContain("toggles");
  });

  it("offers no notification controls", () => {
    render(<NotificationsExperience />);

    expect(
      screen.queryByRole("checkbox") &&
        screen.queryByRole("switch") &&
        screen.queryByRole("button"),
    ).toBeNull();
  });
});