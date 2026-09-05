// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import SignInPage from "@/app/auth/sign-in/page";
import SignUpPage from "@/app/auth/sign-up/page";
import { NomiRecommendation } from "@/components/nomi/nomi-recommendation";
import { PracticeFeedback } from "@/components/practice/practice-feedback";
import { TutorEmptyState } from "@/components/tutor/tutor-empty-state";
import { TutorOffline } from "@/components/tutor/tutor-offline";
import { NotificationsExperience } from "@/components/notifications/notifications-experience";

vi.mock("@/server/auth/actions", () => ({
  signInAction: vi.fn(),
  signUpAction: vi.fn(),
}));

describe("Nomi character integration", () => {
  it("uses the approved encouraging companion on the welcome gateway", () => {
    const { container } = render(<HomePage />);

    expect(container.querySelector("img[data-logo-variant=\"primaryLockup\"]")).toBeNull();
    expect(container.querySelector("img[data-state]")).toHaveAttribute("data-state", "encouraging");
  });

  it("uses approved wordmarks and an appropriate desktop companion for auth", () => {
    for (const [Page, state] of [
      [SignInPage, "encouraging"],
      [SignUpPage, "curious"],
    ] as const) {
      cleanup();
      const { container } = render(<Page />);
      expect(container.querySelector("img[data-wordmark-variant=\"inverse\"]")).toBeInTheDocument();
      expect(container.querySelector("img[data-wordmark-variant=\"purple\"]")).toBeInTheDocument();
      expect(container.querySelector("img[data-state]")).toHaveAttribute("data-state", state);
    }
  });

  it("maps the home recommendation from its persisted intervention", () => {
    const { container } = render(
      <NomiRecommendation intervention="increase_challenge" topicName="Factorisation" />,
    );

    expect(container.querySelector("img")).toHaveAttribute("data-state", "challenge");
  });

  it("uses full-fidelity companion states for tutor and truthful empty surfaces", () => {
    const tutor = render(
      <TutorEmptyState
        context={{ subjectName: "Mathematics", topicName: "Factorisation" }}
        onFill={() => {}}
      />,
    );
    expect(tutor.container.querySelector("img")).toHaveAttribute("data-state", "curious");
    expect(tutor.container.querySelector("img")).toHaveAttribute("width", "112");
    expect(tutor.container.querySelector("img")).toHaveAttribute("alt", "");

    cleanup();
    const offline = render(<TutorOffline />);
    expect(offline.container.querySelector("img")).toHaveAttribute("data-state", "supportive");

    cleanup();
    const notifications = render(<NotificationsExperience />);
    expect(notifications.container.querySelector("img")).toHaveAttribute(
      "data-state",
      "supportive",
    );
  });

  it("uses the deterministic practice result reaction rather than a default avatar", () => {
    const { container } = render(
      <PracticeFeedback
        result={{ correct: false, explanation: "Try a simpler setup.", intervention: "simplify" }}
        onContinue={() => {}}
        onRetry={() => {}}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("data-state", "supportive");
  });
});
