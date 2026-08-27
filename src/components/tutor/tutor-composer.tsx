"use client";

import { ArrowUp } from "lucide-react";

export function TutorComposer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      className="flex items-end gap-2 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-2 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) {
          onSend();
        }
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Message Nomi</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) {
                onSend();
              }
            }
          }}
          placeholder="Ask Nomi a question..."
          maxLength={1000}
          rows={2}
          disabled={disabled}
          className="block max-h-40 min-h-11 w-full resize-y rounded-[var(--nomi-radius-medium)] border border-transparent bg-transparent p-2 text-sm leading-relaxed text-nomi-ink placeholder:text-nomi-muted focus:border-nomi-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nomi-purple-600 text-white transition-colors hover:bg-nomi-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomi-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowUp aria-hidden="true" className="h-5 w-5" />
      </button>
    </form>
  );
}