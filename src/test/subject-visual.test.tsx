// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContinueLearningCard } from "@/components/learn/continue-learning-card";
import { LearnContinueCard } from "@/components/learn/learn-continue-card";
import {
  SUBJECT_3D_ASSETS,
  Subject3DVisual,
  subjectAssetForSubject,
} from "@/components/ui/subject-visual";

describe("Subject3DVisual", () => {
  it("maps every supported subject to its supplied local production PNG", () => {
    for (const [subject, asset] of Object.entries(SUBJECT_3D_ASSETS)) {
      expect(subjectAssetForSubject(subject)).toBe(asset);
    }
  });

  it("renders a decorative, contained image for a supported subject", () => {
    const { container } = render(<Subject3DVisual subject="Mathematics" size="lg" />);
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("src", SUBJECT_3D_ASSETS.mathematics);
    expect(image).toHaveAttribute("data-subject-visual", "mathematics");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveStyle({ objectFit: "contain" });
    expect(container.querySelector("svg")).toBeNull();
  });

  it("keeps the generic learning fallback for unsupported subjects", () => {
    const { container } = render(<Subject3DVisual subject="History" />);

    expect(subjectAssetForSubject("History")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[data-subject-visual="fallback"]')).toBeInTheDocument();
  });
});

describe("subject 3D visual integrations", () => {
  it("uses the mathematics asset in the Home continue-learning hero", () => {
    const { container } = render(
      <ContinueLearningCard subject="Mathematics" currentTopic="Factorisation" />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      SUBJECT_3D_ASSETS.mathematics,
    );
  });

  it("uses the mathematics asset in the Learn continue-learning hero", () => {
    const { container } = render(
      <LearnContinueCard
        view={{
          kind: "continue",
          subjectName: "Mathematics",
          parentName: "Algebra",
          topicName: "Factorisation",
          state: { key: "needs-practice", label: "Needs practice", cue: null, actionLabel: "Practise" },
        }}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      SUBJECT_3D_ASSETS.mathematics,
    );
  });
});
