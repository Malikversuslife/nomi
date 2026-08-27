// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { sendTutorMessageAction } from "@/server/tutor/actions";
import { TutorExperience } from "@/components/tutor/tutor-experience";
import type { TutorInitialData } from "@/domain/tutor/types";
import type { TutorActionResult } from "@/server/tutor/types";

vi.mock("@/server/tutor/actions", () => ({
  sendTutorMessageAction: vi.fn(),
}));

const mockSend = vi.mocked(sendTutorMessageAction);

const initialData: TutorInitialData = {
  threadId: null,
  messages: [],
  context: { subjectName: "Mathematics", topicName: "Factorisation" },
};

const threadedData: TutorInitialData = {
  threadId: "1620a80c-4f2a-4a1a-8d23-4d9e0a2f1b7c",
  messages: [
    {
      id: "0f8a1c1e-9b2d-4b5a-9c0d-1e2f3a4b5c6d",
      role: "user",
      content: "Explain factorising the difference of squares.",
      suggestedAction: "none",
      followUp: null,
    },
    {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      role: "assistant",
      content: "It writes a^2 - b^2 as (a - b)(a + b).",
      suggestedAction: "practice",
      followUp: "Try one with a = x and b = 3?",
    },
  ],
  context: { subjectName: "Algorithms", topicName: null },
};

describe("TutorExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({
      ok: true,
      threadId: "new-thread-1",
      context: { subjectName: "Mathematics", topicName: "Factorisation" },
      messages: [
        {
          id: "user-1",
          role: "user",
          content: "Explain factorising.",
          suggestedAction: null,
          followUp: null,
        },
        {
          id: "ai-1",
          role: "assistant",
          content: "Sure thing! Factorising reverses expansion.",
          suggestedAction: "none",
          followUp: null,
        },
      ],
    });
  });

  it("shows the first-visit empty state with topic-aware copy", () => {
    render(<TutorExperience initialData={initialData} />);

    expect(screen.getByRole("heading", { name: "What are you stuck on?" })).toBeInTheDocument();
    expect(screen.getByText(/I can explain a concept, work through a problem, or give you a hint/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Want to go through it together\?/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Give me a hint" })).toBeInTheDocument();
  });

  it("sends a full conversational prompt from the empty-state chip", async () => {
    render(<TutorExperience initialData={initialData} />);

    fireEvent.click(screen.getByRole("button", { name: "Work through an example" }));

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({ message: "Work through an example", threadId: null });
    });
  });

  it("sends on Enter and preserves Shift+Enter newlines for typing", async () => {
    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "Hi Nomi" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({ message: "Hi Nomi", threadId: null });
    });
  });

  it("disables the composer while a message is pending", async () => {
    mockSend.mockImplementation(() => new Promise<never>(() => {}));

    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "Slow answer please" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByLabelText("Message Nomi")).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("shows an error with Try again and preserves the draft on failure, then recovers", async () => {
    mockSend
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ok: true,
        threadId: "new-thread-2",
        context: { subjectName: "Mathematics", topicName: "Factorisation" },
        messages: [
          {
            id: "user-2",
            role: "user",
            content: "Explain swapping",
            suggestedAction: null,
            followUp: null,
          },
          {
            id: "ai-2",
            role: "assistant",
            content: "Alright.",
            suggestedAction: "none",
            followUp: null,
          },
        ],
      });

    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "Explain swapping" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/Nomi couldn't answer that just now\./i)).toBeInTheDocument();
    });
    expect(textarea).toHaveValue("Explain swapping");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByText("Alright.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Nomi couldn't answer that just now\./i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Message Nomi")).toHaveValue("");
  });

  it("renders an existing conversation, follow-ups, and the practice CTA without leaking ids", () => {
    render(<TutorExperience initialData={threadedData} />);

    expect(screen.queryByRole("heading", { name: "What are you stuck on?" })).not.toBeInTheDocument();
    expect(screen.getByText("Explain factorising the difference of squares.")).toBeInTheDocument();
    expect(screen.getByText(/It writes a/)).toBeInTheDocument();
    expect(screen.getByText(/Nomi asks: Try one with a = x and b = 3\?/i)).toBeInTheDocument();

    const practiceLink = screen.getByRole("link", { name: "Practice this topic" });
    expect(practiceLink).toHaveAttribute("href", "/practice");

    const log = screen.getByRole("log");
    expect(log.textContent).not.toMatch(/1620a80c|0f8a1c1e|a1b2c3d4/);

    expect(screen.getByText("Algorithms")).toBeInTheDocument();
  });

  it("prefills the composer from prompt chips without sending", async () => {
    render(<TutorExperience initialData={threadedData} />);

    fireEvent.click(screen.getByRole("button", { name: "Show me an example" }));

    expect(screen.getByLabelText("Message Nomi")).toHaveValue("Show me an example");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("renders math superscripts from assistant content", () => {
    render(<TutorExperience initialData={threadedData} />);

    const sups = document.querySelectorAll("sup");
    expect(sups.length).toBeGreaterThan(0);
    expect(Array.from(sups).map((sup) => sup.textContent)).toContain("2");
  });

  it("resets the draft on a successful send", async () => {
    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "What should I review?" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Sure thing! Factorising reverses expansion.")).toBeInTheDocument();
    });
    expect(textarea).toHaveValue("");
  });

  it("transitions out of the first-visit welcome state on submit and keeps the context chip", async () => {
    render(<TutorExperience initialData={initialData} />);

    expect(screen.getByRole("heading", { name: "What are you stuck on?" })).toBeInTheDocument();

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "Explain factorising." } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "What are you stuck on?" }),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByText(/I can explain a concept, work through a problem, or give you a hint/i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("log")).toBeInTheDocument();
    expect(screen.getByText("Explain factorising.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Learn with Nomi" })).toBeInTheDocument();
    expect(screen.getByText("Mathematics · Factorisation")).toBeInTheDocument();
  });

  it("transitions out of the welcome state when a suggestion chip is selected", async () => {
    let resolveSend: (value: TutorActionResult) => void = () => {};
    mockSend.mockImplementationOnce(
      () =>
        new Promise<TutorActionResult>((resolve) => {
          resolveSend = resolve;
        }),
    );

    render(<TutorExperience initialData={initialData} />);

    fireEvent.click(screen.getByRole("button", { name: "Explain this concept" }));

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith({ message: "Explain this concept", threadId: null });
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "What are you stuck on?" }),
      ).not.toBeInTheDocument();
    });

    const logPending = screen.getByRole("log");
    expect(within(logPending).queryAllByText("Explain this concept")).toHaveLength(1);

    await act(async () => {
      resolveSend({
        ok: true,
        threadId: "new-thread-x",
        context: { subjectName: "Mathematics", topicName: "Factorisation" },
        messages: [
          {
            id: "u-x",
            role: "user",
            content: "Explain this concept",
            suggestedAction: null,
            followUp: null,
          },
          {
            id: "a-x",
            role: "assistant",
            content: "Let's go step by step.",
            suggestedAction: "none",
            followUp: null,
          },
        ],
      });
    });

    expect(screen.getByText("Let's go step by step.")).toBeInTheDocument();
    const logAfter = screen.getByRole("log");
    expect(within(logAfter).queryAllByText("Explain this concept")).toHaveLength(1);
  });

  it("shows the thinking state while pending and never flashes stale content", async () => {
    mockSend.mockImplementation(() => new Promise<never>(() => {}));

    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "How do I factorise?" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/Nomi is thinking/)).toBeInTheDocument();
    });

    expect(within(screen.getByRole("log")).getByText("How do I factorise?")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "What are you stuck on?" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Sure thing!")).not.toBeInTheDocument();
  });

  it("keeps all first-visit suggestion chips discoverable (structural)", () => {
    render(<TutorExperience initialData={initialData} />);

    for (const label of [
      "Explain this concept",
      "Give me a hint",
      "Work through an example",
      "Why did I get this wrong?",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("stays in conversation mode after a provider failure without restoring the welcome state", async () => {
    mockSend.mockRejectedValueOnce(new Error("provider down"));

    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "Help me factorise" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/Nomi couldn't answer that just now\./i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("heading", { name: "What are you stuck on?" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/I can explain a concept, work through a problem, or give you a hint/i),
    ).not.toBeInTheDocument();

    const log = screen.getByRole("log");
    expect(within(log).queryAllByText("Help me factorise")).toHaveLength(1);

    const bodyText = document.body.textContent ?? "";
    for (const token of ["429", "insufficient_quota", "OpenAI", "billing", "API key", "provider"]) {
      expect(bodyText).not.toContain(token);
    }
  });

  it("retries the failed learner message without visibly duplicating it", async () => {
    mockSend
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce({
        ok: true,
        threadId: "new-thread-3",
        context: { subjectName: "Mathematics", topicName: "Factorisation" },
        messages: [
          {
            id: "user-3",
            role: "user",
            content: "What is a quadratic?",
            suggestedAction: null,
            followUp: null,
          },
          {
            id: "ai-3",
            role: "assistant",
            content: "A quadratic has an x^2 term.",
            suggestedAction: "none",
            followUp: null,
          },
        ],
      });

    render(<TutorExperience initialData={initialData} />);

    const textarea = screen.getByLabelText("Message Nomi");
    fireEvent.change(textarea, { target: { value: "What is a quadratic?" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(/Nomi couldn't answer that just now\./i)).toBeInTheDocument();
    });

    const logBefore = screen.getByRole("log");
    expect(within(logBefore).queryAllByText("What is a quadratic?")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByText(/A quadratic has an x/)).toBeInTheDocument();
    });

    const logAfter = screen.getByRole("log");
    expect(within(logAfter).queryAllByText("What is a quadratic?")).toHaveLength(1);
    expect(
      screen.queryByText(/Nomi couldn't answer that just now\./i),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Message Nomi")).toHaveValue("");
  });
});