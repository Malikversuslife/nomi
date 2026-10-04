"use client";

import { useEffect, useRef, useState } from "react";
import { sendTutorMessageAction } from "@/server/tutor/actions";
import type { TutorInitialData, TutorMessageView } from "@/domain/tutor/types";
import { tutorContextChip } from "@/domain/tutor/context";
import { ContextChip } from "@/components/ui/context-chip";
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

export function TutorExperience({ initialData, topicId }: { initialData: TutorInitialData; topicId?: string }) {
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
      const result = await sendTutorMessageAction({ message: value, threadId, topicId });

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
    <div className="mx-auto w-full max-w-[820px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
        <div>
          <h1 className="font-display text-[2.25rem] font-semibold tracking-[-0.045em] text-nomi-ink sm:text-[2.75rem]">
            Learn with Nomi
          </h1>
          <p className="mt-1 text-sm text-nomi-muted">
            Ask about what you&apos;re learning.
          </p>
        </div>
        {chip ? <ContextChip>{chip}</ContextChip> : null}
      </header>

      {context.topicName ? (
        <section className="nomi-feature mb-6 rounded-[var(--nomi-radius-feature)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Current context</p>
          <p className="mt-1 font-display text-xl font-bold text-nomi-ink">{context.topicName}</p>
          {context.mastery != null ? <p className="mt-2 text-sm text-nomi-muted">{context.mastery}/100 mastery · Level {context.difficulty ?? 1} · {context.recentAccuracy ?? 0}% recent accuracy</p> : null}
          {context.recentAttemptCount ? <p className="mt-1 text-sm font-semibold text-nomi-purple-600">Recent assessed Practice · {context.recentCorrectCount}/{context.recentAttemptCount} correct</p> : null}
        </section>
      ) : null}

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
            <TutorMessage key={message.id} message={message} practiceHref={topicId ? `/practice?topic=${encodeURIComponent(topicId)}` : "/practice"} />
          ))}
          {pending ? <TutorLoading /> : null}
          <div ref={endRef} className="scroll-mb-[calc(var(--nomi-safe-bottom)+14rem)]" />
        </div>
      )}

      <div className="nomi-material sticky bottom-[calc(1rem+var(--nomi-safe-bottom))] z-30 mt-5 rounded-[var(--nomi-radius-feature)] border border-black/[0.06] p-3 shadow-[0_14px_42px_rgb(0_0_0/0.1)] lg:bottom-4">
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
