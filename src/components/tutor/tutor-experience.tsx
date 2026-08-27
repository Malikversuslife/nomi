"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { sendTutorMessageAction } from "@/server/tutor/actions";
import type { TutorInitialData, TutorMessageView } from "@/domain/tutor/types";
import { tutorContextChip } from "@/domain/tutor/context";
import { TutorComposer } from "./tutor-composer";
import { TutorEmptyState } from "./tutor-empty-state";
import { TutorError } from "./tutor-error";
import { TutorLoading } from "./tutor-loading";
import { TutorMessage } from "./tutor-message";
import { TutorPromptChips } from "./tutor-prompt-chips";

const promptSuggestions = [
  "Explain this simply",
  "Show me an example",
  "Give me a hint",
  "What should I review?",
];

export function TutorExperience({ initialData }: { initialData: TutorInitialData }) {
  const [messages, setMessages] = useState<TutorMessageView[]>(initialData.messages);
  const [threadId, setThreadId] = useState<string | null>(initialData.threadId);
  const [context, setContext] = useState(initialData.context);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [lastSent, setLastSent] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  // The learner's most recent message stays visible while it is awaiting a
  // reply or after a failure, so the welcome state never returns mid-session.
  const stagedMessage: TutorMessageView | null = lastSent
    ? {
        id: "staged-user-message",
        role: "user",
        content: lastSent,
        suggestedAction: null,
        followUp: null,
      }
    : null;

  const started = messages.length > 0 || stagedMessage !== null;
  const visibleMessages: TutorMessageView[] = stagedMessage
    ? [...messages, stagedMessage]
    : messages;

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [visibleMessages.length, pending, error]);

  async function send(text: string) {
    const value = text.trim();

    if (!value || pending) {
      return;
    }

    setPending(true);
    setError(false);
    setLastSent(value);

    try {
      const result = await sendTutorMessageAction({ message: value, threadId });

      if (result.ok) {
        setMessages(result.messages);
        setThreadId(result.threadId);
        setContext(result.context);
        setDraft("");
        setLastSent("");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  const chip = tutorContextChip(context);

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">
            Nomi
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-4xl">
            Learn with Nomi
          </h1>
          <p className="mt-1 text-sm text-nomi-muted">Ask about what you&apos;re learning.</p>
        </div>
        {chip ? (
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--nomi-radius-pill)] border border-nomi-purple-100 bg-nomi-purple-100/60 px-3 text-xs font-semibold text-nomi-purple-700">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{chip}</span>
          </span>
        ) : null}
      </header>

      {!started ? (
        <TutorEmptyState
          context={context}
          onFill={(text) => {
            setDraft(text);
            send(text);
          }}
        />
      ) : (
        <div role="log" aria-label="Tutor conversation" className="space-y-4">
          {visibleMessages.map((message) => (
            <TutorMessage key={message.id} message={message} />
          ))}
          {pending ? <TutorLoading /> : null}
          <div ref={endRef} className="scroll-mb-[calc(var(--nomi-safe-bottom)+14rem)]" />
        </div>
      )}

      <div className="sticky bottom-[calc(4.5rem+var(--nomi-safe-bottom))] z-30 mt-4 border-t border-nomi-border bg-nomi-background pt-3 pb-1 lg:bottom-0">
        {error ? (
          <TutorError
            onRetry={() => {
              if (lastSent) {
                send(lastSent);
              }
            }}
          />
        ) : null}

        {messages.length > 0 && !pending ? (
          <TutorPromptChips
            prompts={promptSuggestions}
            onFill={(text) => setDraft(text)}
          />
        ) : null}

        <TutorComposer
          value={draft}
          onChange={setDraft}
          onSend={() => send(draft)}
          disabled={pending}
        />
      </div>
    </div>
  );
}