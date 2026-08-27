// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TutorOffline } from "@/components/tutor/tutor-offline";

describe("TutorOffline", () => {
  it("shows the unavailable message and practice/learn actions", () => {
    render(<TutorOffline />);

    expect(screen.getByRole("heading", { name: "Nomi is unavailable right now." })).toBeInTheDocument();
    expect(
      screen.getByText(/You can keep practising or explore your learning path\./),
    ).toBeInTheDocument();

    const practiceLink = screen.getByRole("link", { name: "Practice" });
    expect(practiceLink).toHaveAttribute("href", "/practice");

    const learnLink = screen.getByRole("link", { name: "Learn" });
    expect(learnLink).toHaveAttribute("href", "/learn");
  });
});