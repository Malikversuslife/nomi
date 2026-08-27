// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SubjectSelector } from "@/components/learn/subject-selector";
import type { SubjectSelectorOption } from "@/components/learn/subject-selector";

const subjects: SubjectSelectorOption[] = [
  { slug: "mathematics", name: "Mathematics", iconKey: "calculator" },
  { slug: "physics", name: "Physics", iconKey: "atom" },
  { slug: "chemistry", name: "Chemistry", iconKey: "flask" },
  { slug: "biology", name: "Biology", iconKey: "leaf" },
];

describe("SubjectSelector", () => {
  it("renders a labelled group with one chip per subject", () => {
    render(
      <SubjectSelector subjects={subjects} selected="mathematics" onSelect={() => {}} />,
    );

    expect(
      screen.getByRole("group", { name: "Choose a subject" }),
    ).toBeInTheDocument();

    for (const subject of subjects) {
      expect(
        screen.getByRole("button", { name: subject.name }),
      ).toBeInTheDocument();
    }
  });

  it("marks the selected subject with aria-pressed", () => {
    render(
      <SubjectSelector subjects={subjects} selected="mathematics" onSelect={() => {}} />,
    );

    expect(
      screen.getByRole("button", { name: "Mathematics" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Physics" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports selection changes by subject slug", () => {
    const onSelect = vi.fn();
    render(
      <SubjectSelector subjects={subjects} selected="mathematics" onSelect={onSelect} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Physics" }));
    expect(onSelect).toHaveBeenCalledWith("physics");
  });

  it("is operable by keyboard (focusable buttons activate selection)", () => {
    const onSelect = vi.fn();
    render(
      <SubjectSelector subjects={subjects} selected="mathematics" onSelect={onSelect} />,
    );

    const button = screen.getByRole("button", { name: "Biology" });
    button.focus();
    expect(button).toHaveFocus();

    button.click();
    expect(onSelect).toHaveBeenCalledWith("biology");
  });

  it("renders nothing without subjects", () => {
    const { container } = render(
      <SubjectSelector subjects={[]} selected="" onSelect={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});