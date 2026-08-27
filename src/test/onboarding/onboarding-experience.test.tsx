// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OnboardingExperience } from "@/components/onboarding/onboarding-experience";
import type {
  OnboardingCompleteActionState,
  OnboardingExperienceData,
  OnboardingSubjectView,
} from "@/domain/onboarding/types";

const subjects: OnboardingSubjectView[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    description: "Patterns, numbers, algebra, and problem solving.",
    iconKey: "calculator",
    startingTopic: {
      subjectName: "Mathematics",
      unitName: "Algebra",
      groupName: "Quadratic equations",
      topicName: "Factorisation",
    },
  },
  {
    slug: "physics",
    name: "Physics",
    description: "Forces, motion, energy, and how the physical world works.",
    iconKey: "atom",
    startingTopic: {
      subjectName: "Physics",
      unitName: "Motion",
      groupName: null,
      topicName: "Speed and velocity",
    },
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    description: "Matter, reactions, and the substances around us.",
    iconKey: "flask",
    startingTopic: {
      subjectName: "Chemistry",
      unitName: "Chemical reactions",
      groupName: null,
      topicName: "Balancing equations",
    },
  },
  {
    slug: "biology",
    name: "Biology",
    description: "Cells, organisms, and living systems.",
    iconKey: "leaf",
    startingTopic: {
      subjectName: "Biology",
      unitName: "Cell biology",
      groupName: null,
      topicName: "Cell structure",
    },
  },
];

function sampleData(overrides: Partial<OnboardingExperienceData> = {}): OnboardingExperienceData {
  return { displayName: null, subjects, ...overrides };
}

const noopAction = async (
  state: OnboardingCompleteActionState,
): Promise<OnboardingCompleteActionState> => state;

function goToSubjectStep() {
  fireEvent.click(screen.getByRole("button", { name: "Get started" }));
}

function selectSubject(slug: string) {
  const label = subjects.find((subject) => subject.slug === slug);
  const name = label?.name ?? "";
  const radio = screen.getByRole("radio", { name: new RegExp(name) });
  fireEvent.click(radio);
}

function goToReadyStep(slug: string) {
  goToSubjectStep();
  selectSubject(slug);
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("OnboardingExperience", () => {
  it("starts on the welcome step with Nomi copy and a Get started CTA", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);

    expect(screen.getByRole("heading", { name: "Welcome to Nomi" })).toBeInTheDocument();
    expect(
      screen.getByText(/I'll help you practise at the right level/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(document.querySelector("[data-state='encouraging']")).not.toBeNull();
  });

  it("greets the learner by display name when one exists", () => {
    render(
      <OnboardingExperience
        data={sampleData({ displayName: "Alex" })}
        completeAction={noopAction}
      />,
    );

    expect(screen.getByText("Hi, Alex.")).toBeInTheDocument();
  });

  it("advances to subject choice drawn from the canonical curriculum", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToSubjectStep();

    expect(
      screen.getByRole("heading", { name: "What do you want to work on first?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Choose a subject" }),
    ).toBeInTheDocument();

    for (const subject of subjects) {
      expect(
        screen.getByRole("radio", { name: new RegExp(subject.name) }),
      ).toBeInTheDocument();
    }

    expect(document.querySelector("[data-state='curious']")).not.toBeNull();
  });

  it("requires a subject before allowing Continue", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToSubjectStep();

    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeDisabled();
  });

  it("announces selection in text, not colour alone", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToSubjectStep();

    selectSubject("mathematics");

    const radio = screen.getByRole("radio", { name: new RegExp("Mathematics") });
    expect(radio).toBeChecked();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeEnabled();
  });

  it("keeps the subject group single-select", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToSubjectStep();

    selectSubject("mathematics");
    selectSubject("physics");

    expect(
      screen.getByRole("radio", { name: new RegExp("Mathematics") }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: new RegExp("Physics") }),
    ).toBeChecked();
  });

  it("ends on a ready step that names the canonical first topic", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToReadyStep("mathematics");

    expect(
      screen.getByRole("heading", { name: "Let's start with Mathematics." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("Quadratic equations")).toBeInTheDocument();
    expect(screen.getByText("Factorisation")).toBeInTheDocument();
    expect(document.querySelector("[data-state='celebrating']")).not.toBeNull();
  });

  it("shows a unit-level first topic without a phantom group", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToReadyStep("physics");

    expect(screen.getByText("Motion")).toBeInTheDocument();
    expect(screen.getByText("Speed and velocity")).toBeInTheDocument();
    expect(screen.queryByText("Quadratic equations")).not.toBeInTheDocument();
  });

  it("handles a missing starting topic gracefully", () => {
    const data = sampleData({
      subjects: subjects.map((subject, index) =>
        index === 0 ? { ...subject, startingTopic: null } : subject,
      ),
    });
    render(<OnboardingExperience data={data} completeAction={noopAction} />);
    goToReadyStep("mathematics");

    expect(
      screen.getByText(/We'll get you started with Mathematics anyway/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start practising" }),
    ).toBeInTheDocument();
  });

  it("wires the completion form to persist the chosen subject and destination", async () => {
    const submitted: { formData: FormData | null } = { formData: null };
    const captureAction = async (state: OnboardingCompleteActionState, fd: FormData) => {
      submitted.formData = fd;
      return state;
    };

    const { container } = render(
      <OnboardingExperience data={sampleData()} completeAction={captureAction} />,
    );
    goToReadyStep("mathematics");

    const hidden = container.querySelector('input[name="subjectSlug"]');
    expect(hidden).not.toBeNull();
    expect(hidden?.getAttribute("value")).toBe("mathematics");

    const practise = screen.getByRole("button", { name: "Start practising" });
    const explore = screen.getByRole("button", { name: "Explore the subject" });
    expect(practise).toHaveAttribute("name", "destination");
    expect(practise).toHaveAttribute("value", "practice");
    expect(explore).toHaveAttribute("name", "destination");
    expect(explore).toHaveAttribute("value", "learn");

    fireEvent.click(practise);
    await waitFor(() => expect(submitted.formData).not.toBeNull());
    const formData = submitted.formData;
    expect(formData).not.toBeNull();
    if (!formData) {
      throw new Error("Expected the completion form to be submitted");
    }
    expect(formData.get("subjectSlug")).toBe("mathematics");
    expect(formData.get("destination")).toBe("practice");
  });

  it("shows a learner-safe error and Try again when persistence fails", async () => {
    const failingAction = async (
      state: OnboardingCompleteActionState,
    ): Promise<OnboardingCompleteActionState> => ({
      ...state,
      error: "We couldn't save that just now.",
    });

    render(<OnboardingExperience data={sampleData()} completeAction={failingAction} />);
    goToReadyStep("mathematics");

    fireEvent.click(screen.getByRole("button", { name: "Start practising" }));

    await waitFor(() => {
      expect(
        screen.getByRole("alert").textContent,
      ).toContain("We couldn't save that just now.");
      expect(
        screen.getByRole("button", { name: "Try again" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Let's start with Mathematics." }),
      ).toBeInTheDocument();
    });
  });

  it("preserves the selected subject when navigating back then forward", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToReadyStep("mathematics");

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(
      screen.getByRole("radio", { name: new RegExp("Mathematics") }),
    ).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByRole("heading", { name: "Let's start with Mathematics." }),
    ).toBeInTheDocument();
  });

  it("lets the learner return from subject choice to welcome", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToSubjectStep();

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));

    expect(screen.getByRole("heading", { name: "Welcome to Nomi" })).toBeInTheDocument();
  });

  it("keeps touch targets at least 44px tall", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);

    expect(screen.getByRole("button", { name: "Get started" })).toHaveClass("min-h-11");

    goToSubjectStep();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass("min-h-11");
    expect(screen.getByRole("button", { name: "Go back" })).toHaveClass("min-h-11");

    selectSubject("mathematics");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("button", { name: "Start practising" })).toHaveClass(
      "min-h-11",
    );
    expect(screen.getByRole("button", { name: "Explore the subject" })).toHaveClass(
      "min-h-11",
    );
  });

  it("does not leak internal ids, slugs, or engine detail", () => {
    const { container } = render(
      <OnboardingExperience data={sampleData()} completeAction={noopAction} />,
    );
    goToReadyStep("mathematics");

    const text = container.textContent ?? "";

    expect(text).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );

    for (const internal of [
      "factorisation",
      "quadratic-equations",
      "mathematics",
      "physics",
      "learner_subjects",
      "subject_id",
      "user_id",
      "status",
      "destination",
      "subjectSlug",
    ]) {
      expect(text).not.toContain(internal);
    }
  });

  it("renders inside a focused shell without bottom navigation", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders a one-step-at-a-time flow with a visible progress cue", () => {
    render(<OnboardingExperience data={sampleData()} completeAction={noopAction} />);
    goToReadyStep("mathematics");

    expect(screen.queryByText("Welcome to Nomi")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
  });

  it("re-submits on Try again after a failed persistence", async () => {
    const spy = vi.fn(
      async (state: OnboardingCompleteActionState) => ({ ...state, error: "We couldn't save that just now." }),
    );

    render(<OnboardingExperience data={sampleData()} completeAction={spy} />);
    goToReadyStep("mathematics");

    fireEvent.click(screen.getByRole("button", { name: "Start practising" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(spy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });
});