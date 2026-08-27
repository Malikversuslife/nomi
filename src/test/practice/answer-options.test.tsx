// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AnswerOptions } from "@/components/practice/answer-options";

const options = [
  { id: "a", label: "(x+1)(x+6)" },
  { id: "b", label: "x^2 + 7x + 6" },
  { id: "c", label: "(x+7)(x+1)" },
];

describe("AnswerOptions", () => {
  it("renders math labels with superscripts", () => {
    render(
      <AnswerOptions
        interactive
        onSelect={() => {}}
        options={options}
        revealCorrect={false}
        selectedId=""
        submitted={false}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onSelect when an option is chosen", () => {
    const onSelect = vi.fn();
    render(
      <AnswerOptions
        interactive
        onSelect={onSelect}
        options={options}
        revealCorrect={false}
        selectedId=""
        submitted={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("(x+1)(x+6)"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("reveals Correct answer with an explicit label when the learner answered correctly", () => {
    render(
      <AnswerOptions
        interactive
        onSelect={() => {}}
        options={options}
        revealCorrect
        selectedId="b"
        submitted
      />,
    );

    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.queryByText("Your answer")).not.toBeInTheDocument();
  });

  it("does NOT reveal the correct option after a wrong answer", () => {
    render(
      <AnswerOptions
        interactive
        onSelect={() => {}}
        options={options}
        revealCorrect={false}
        selectedId="a"
        submitted
      />,
    );

    expect(screen.getByText("Your answer")).toBeInTheDocument();
    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
  });

  it("declares every option by explicit label for screen readers", () => {
    render(
      <AnswerOptions
        interactive
        onSelect={() => {}}
        options={options}
        revealCorrect={false}
        selectedId=""
        submitted={false}
      />,
    );

    for (const option of options) {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    }
  });
});