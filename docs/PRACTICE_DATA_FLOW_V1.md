# Practice Data Flow V1

Milestone 4 proves the deterministic adaptive loop against persisted Supabase data using seeded questions only. It does not add AI question generation, Tutor behavior, or final Practice UI.

## Question Model

Seeded questions live in `practice_questions` and reference canonical `topics.id`. The learner-facing question omits `expected_answer`, `explanation`, and misconception metadata until after submission.

Supported V1 types:

- `multiple_choice`
- `short_answer`

## Submission Boundary

The client may submit only:

- `questionId`
- `learnerAnswer`
- optional `learningSessionId`
- `submissionKey`
- optional `responseTimeMs`

The server derives user ID, topic ID, expected answer, correctness, difficulty, mastery, intervention, and misconception state from authenticated session and trusted question/progress data.

## Misconception Identity

Milestone 4 uses one deterministic misconception identity for lookup, domain input, and persistence:

```text
topic_progress_id + misconception_key + misconception_category
```

The current schema persists `misconception_key` into `misconception_state.concept_name`; that mapping is intentional for this milestone and must be used consistently. Occurrence count is calculated by the TypeScript lifecycle path from prior persisted occurrence evidence plus the current matching attempt, then SQL stores the returned count without incrementing it again.

## Transaction Strategy

TypeScript remains authoritative for adaptive calculations. The database RPC `persist_practice_result` atomically persists the already-calculated result:

- inserts immutable `practice_attempts`
- updates `topic_progress`
- upserts `misconception_state` when deterministic misconception evidence exists

If a `submissionKey` was already used by the learner, the RPC returns the existing attempt ID and does not insert duplicate evidence.

## Safety

Canonical IDs remain authoritative. Snapshot labels in `practice_attempts` are historical readability only. Hidden reasoning is not produced or persisted.
