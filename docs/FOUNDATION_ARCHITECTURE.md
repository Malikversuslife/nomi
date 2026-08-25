# Nomi Foundation Architecture

This note records the approved V1 foundation decisions before product implementation. It is not a database migration or adaptive-engine implementation.

## Approved Foundation

- Framework: Next.js App Router.
- Language: TypeScript strict mode.
- Styling: Tailwind CSS with Nomi brand tokens.
- Backend direction: Supabase with RLS, introduced in a later milestone.
- Validation direction: zod at server and external-input boundaries.
- Tests: Vitest for deterministic logic and foundation tests; Playwright later for E2E.
- AI boundary: server-only routes/adapters; no client-side provider keys.
- IA: Home, Learn, Nomi, Progress.
- PWA: part of the initial app foundation.

## PWA Foundation

Milestone 1 includes the web app manifest, metadata, theme/background colors, mobile viewport, safe-area CSS variables, placeholder icons, and standalone display behavior.

Advanced service-worker caching, offline AI behavior, and offline synchronization remain later milestones.

## Canonical Curriculum Direction

Add a lightweight canonical curriculum model in the schema milestone:

```text
subjects
  id
  slug
  name
  description
  icon_key
  sort_order
  active

topics
  id
  subject_id
  parent_topic_id nullable
  slug
  name
  description
  level/depth
  sort_order
  active
```

Topics must support hierarchy, for example:

```text
Mathematics
-> Algebra
-> Quadratic equations
-> Factorisation
```

Do not build a large curriculum CMS for V1. Seed only enough canonical data to demonstrate Nomi properly.

## Topic Integrity

`topic_progress` should reference `user_id`, `learner_subject_id`, and canonical `topic_id`, with a unique constraint preventing duplicate progress records for the same learner/topic.

AI must never create canonical parent topics. AI may generate or classify a concept/subskill beneath an authoritative topic, but the application owns subject/topic identity.

## Practice Snapshots

`practice_attempts` should use canonical IDs for relationships. Human-readable subject/topic labels may be stored only as historical snapshots of what the learner saw at attempt time.

Snapshot labels are not source-of-truth identifiers and must not drive learner-state aggregation.

## Mastery V1 Plan

Mastery must be deterministic, bounded, normalized to 0-100, explainable, and independently unit-tested. It must not use an LLM.

Proposed V1 model before implementation:

```text
base_delta = correctness_sign * difficulty_weight * recency_weight * easy_repeat_weight

correctness_sign:
  correct   = +1
  incorrect = -1.2

difficulty_weight:
  0.6 + (difficulty / 10)
  range: 0.7 at difficulty 1 to 1.6 at difficulty 10

recency_weight:
  recent_accuracy >= 0.8 = 1.1
  recent_accuracy >= 0.5 = 1.0
  recent_accuracy < 0.5  = 0.9

easy_repeat_weight:
  if difficulty <= 3 and current_mastery >= 70 then 0.45
  otherwise 1.0

mastery_delta = base_delta * 4
next_mastery = clamp(round(current_mastery + mastery_delta), 0, 100)
```

Example calculations:

```text
Current mastery 40, correct difficulty 5, recent accuracy 0.75:
base_delta = 1 * 1.1 * 1.0 * 1.0 = 1.1
mastery_delta = 4.4
next mastery = 44

Current mastery 78, correct difficulty 2, recent accuracy 0.9:
base_delta = 1 * 0.8 * 1.1 * 0.45 = 0.396
mastery_delta = 1.584
next mastery = 80

Current mastery 62, incorrect difficulty 7, recent accuracy 0.4:
base_delta = -1.2 * 1.3 * 0.9 * 1.0 = -1.404
mastery_delta = -5.616
next mastery = 56
```

These constants are intentionally simple for V1 and should be refined only after observing real learning behavior.
