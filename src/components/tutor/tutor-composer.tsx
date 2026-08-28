"use client";

import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/ui/app-icon";
import { IconButton } from "@/components/ui/icon-button";

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
      className="flex items-end gap-2 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-2 shadow-[0_10px_32px_-12px_rgba(33,29,39,0.28)]"
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
      <IconButton
        type="submit"
        variant="primary"
        disabled={!canSend}
        aria-label="Send message"
      >
        <AppIcon icon={ArrowUp01Icon} size={20} strokeWidth={2} />
      </IconButton>
    </form>
  );
}