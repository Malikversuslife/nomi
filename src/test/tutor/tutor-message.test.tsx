// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TutorMessage } from "@/components/tutor/tutor-message";
import type { TutorMessageView } from "@/domain/tutor/types";

describe("TutorMessage", () => {
  it("renders a user message as a bubble without follow-up or CTA", () => {
    const message: TutorMessageView = {
      id: "m1",
      role: "user",
      content: "Why can't I factorise this?",
      suggestedAction: "none",
      followUp: null,
    };

    render(<TutorMessage message={message} />);

    expect(screen.getByText("Why can't I factorise this?")).toBeInTheDocument();
    expect(screen.queryByText(/Nomi asks:/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders an assistant message with follow-up and a practice CTA", () => {
    const message: TutorMessageView = {
      id: "m2",
      role: "assistant",
      content: "Try grouping the terms.",
      suggestedAction: "practice",
      followUp: "What would you do first?",
    };

    render(<TutorMessage message={message} />);

    expect(screen.getByText("Try grouping the terms.")).toBeInTheDocument();
    expect(screen.getByText(/Nomi asks: What would you do first\?/i)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Practice this topic" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/practice");
  });

  it("renders a review CTA and no practice CTA for review suggestions", () => {
    const message: TutorMessageView = {
      id: "m3",
      role: "assistant",
      content: "Let's revisit the basics.",
      suggestedAction: "review",
      followUp: null,
    };

    render(<TutorMessage message={message} />);

    const reviewLink = screen.getByRole("link", { name: "Review this topic" });
    expect(reviewLink).toHaveAttribute("href", "/learn");
    expect(screen.queryByRole("link", { name: "Practice this topic" })).not.toBeInTheDocument();
  });

  it("renders no CTA for example or none suggestions", () => {
    render(
      <TutorMessage
        message={{
          id: "m4",
          role: "assistant",
          content: "Here is an example being worked through.",
          suggestedAction: "example",
          followUp: null,
        }}
      />,
    );
    render(
      <TutorMessage
        message={{ id: "m5", role: "assistant", content: "Ok.", suggestedAction: "none", followUp: null }}
      />,
    );

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders math notation using superscripts", () => {
    render(
      <TutorMessage
        message={{
          id: "m6",
          role: "assistant",
          content: "Solve x^2 = 4 for x.",
          suggestedAction: "none",
          followUp: null,
        }}
      />,
    );

    const sup = document.querySelector("sup");
    expect(sup).not.toBeNull();
    expect(sup?.textContent).toBe("2");
  });

  it("never surfaces internal ids in the rendered text", () => {
    render(
      <TutorMessage
        message={{
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          role: "assistant",
          content: "Secret id should not appear.",
          suggestedAction: "none",
          followUp: null,
        }}
      />,
    );

    expect(screen.queryByText(/f47ac10b/)).not.toBeInTheDocument();
  });
});