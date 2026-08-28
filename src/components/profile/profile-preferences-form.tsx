"use client";

import { useActionState } from "react";
import { EXPLANATION_STYLE_OPTIONS } from "@/domain/profile/presentation";
import type { ProfilePreferences } from "@/domain/profile/types";
import type { ProfileSettingsActionState } from "@/server/profile/schemas";
import { FeedbackBanner } from "@/components/ui/feedback-banner";

const initialState: ProfileSettingsActionState = {};

const inputClasses =
  "min-h-12 w-full rounded-[var(--nomi-radius-medium)] border border-nomi-border bg-nomi-surface-subtle px-4 text-nomi-ink placeholder:text-nomi-muted focus:border-nomi-purple-500 focus:outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-nomi-error-500">{message}</p>;
}

export function ProfilePreferencesForm({
  preferences,
  action,
}: {
  preferences: ProfilePreferences;
  action: (
    state: ProfileSettingsActionState,
    formData: FormData,
  ) => Promise<ProfileSettingsActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[var(--nomi-radius-large)] border border-nomi-border bg-nomi-surface p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-nomi-ink" htmlFor="displayName">
          Preferred name
        </label>
        <input
          className={inputClasses}
          id="displayName"
          name="displayName"
          defaultValue={preferences.displayName}
          autoComplete="name"
          maxLength={80}
          required
        />
        <FieldError message={state.fieldErrors?.displayName?.[0]} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-nomi-ink" htmlFor="gradeYear">
          Grade or year
        </label>
        <input
          className={inputClasses}
          id="gradeYear"
          name="gradeYear"
          defaultValue={preferences.gradeYear ?? ""}
          placeholder="e.g. Year 9 or Grade 9"
          autoComplete="off"
          maxLength={40}
        />
        <p className="text-sm text-nomi-muted">
          Nomi uses this to keep explanations age-appropriate.
        </p>
        <FieldError message={state.fieldErrors?.gradeYear?.[0]} />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-nomi-ink"
          htmlFor="dailyGoalMinutes"
        >
          Daily practice goal
        </label>
        <input
          className={inputClasses}
          id="dailyGoalMinutes"
          name="dailyGoalMinutes"
          type="number"
          inputMode="numeric"
          min={1}
          max={240}
          defaultValue={preferences.dailyGoalMinutes}
          required
        />
        <p className="text-sm text-nomi-muted">
          Between 1 and 240 minutes a day.
        </p>
        <FieldError message={state.fieldErrors?.dailyGoalMinutes?.[0]} />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-nomi-ink"
          htmlFor="explanationStyle"
        >
          Explanation style
        </label>
        <select
          className={inputClasses}
          id="explanationStyle"
          name="explanationStyle"
          defaultValue={preferences.explanationStyle ?? ""}
        >
          <option value="">Let Nomi choose</option>
          {EXPLANATION_STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-nomi-muted">
          How Nomi tends to explain things back to you.
        </p>
        <FieldError message={state.fieldErrors?.explanationStyle?.[0]} />
      </div>

      {state.success ? (
        <FeedbackBanner variant="success" title="Saved.">
          Your details are up to date.
        </FeedbackBanner>
      ) : null}

      {state.message ? (
        <FeedbackBanner variant="warning" title={state.message} />
      ) : null}

      <button
        className="min-h-12 w-full rounded-[var(--nomi-radius-pill)] bg-nomi-purple-600 px-5 font-semibold text-white shadow-sm transition-colors hover:bg-nomi-purple-700 disabled:cursor-not-allowed disabled:bg-nomi-disabled-bg disabled:text-nomi-disabled-text"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}