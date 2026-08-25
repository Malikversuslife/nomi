# AGENTS.md — Nomi

## Project
**Nomi** is a mobile-first adaptive AI learning companion.

**Tagline:** Learns how you learn.

Before significant product, design, architecture, or UI work, read:
1. `NOMI_BRAND_GUIDELINES.md`
2. `PRODUCT_SPEC.md`

## North Star
The product must visibly demonstrate:

> Learner behaviour → measurable performance → learner state → adaptive decision → changed learning experience.

A reviewer should be able to say: **“Nomi changed how it taught me because of how I performed.”**

## Working Rules
- Plan significant features before building.
- Inspect existing code before changing architecture.
- Mobile is the canonical experience; desktop expands it gracefully.
- Nomi is both mascot and AI tutor. Do not introduce a competing AI persona.
- Do not copy Duolingo layouts, mascot, green identity, wording, assets, or proprietary interaction patterns.
- Use deterministic code for difficulty, mastery, counters, intervention thresholds, topic identity, validation, permissions, and ownership.
- Use AI for tutoring, question generation, hints, explanations, summaries, and concise misconception classification.
- Never expose or persist hidden chain-of-thought.
- Practice is the primary source of quantitative mastery evidence.
- Practice, Tutor, Home, and Progress must share one learner-state model.
- If the application supplies a parent topic, it is authoritative. AI may identify concepts beneath it but must not rename it.

## Technical Direction
Preferred stack:
- React
- TypeScript
- Tailwind CSS
- Supabase
- mobile-first PWA

OpenCode should propose the exact React framework before implementation and justify it.

## Database Rules
- Commit schema changes as migrations.
- Enable Row Level Security for learner-owned data.
- Keep service-role credentials server-side.
- Inspect existing schema before modifying it.
- Avoid redundant tables.
- Use appropriate foreign keys and indexes.

## UI Rules
Follow `NOMI_BRAND_GUIDELINES.md`.

Prioritize:
- ~390px mobile viewport first
- 44px+ practical touch targets
- bottom navigation
- one primary task per screen
- generous whitespace
- rounded tactile controls
- accessible contrast and focus states
- reduced-motion support
- meaningful Nomi reactions

Avoid:
- generic SaaS dashboards
- dense card grids
- generic component-library aesthetics
- excessive gradients/glassmorphism
- random mascot placement
- reward spam

## Code Quality
- Keep TypeScript strict.
- Validate AI/external input.
- Keep domain logic independently testable.
- Avoid duplicated business logic.
- Handle loading, empty, error, and retry states.
- Keep secrets server-side.
- Comment decisions rather than obvious syntax.

## Testing
Unit test:
- difficulty
- mastery
- intervention selection
- misconception lifecycle
- learner-state derivation

As the product matures, add integration/E2E coverage for:
- authentication
- onboarding
- practice
- adaptation
- tutor
- persistence

For UI work verify mobile, desktop, keyboard accessibility, loading, error, and empty states.

## Scope Guardrails
Do not add without approval:
- leaderboards
- social feeds
- parent/teacher dashboards
- certificates
- marketplace
- voice tutor
- multiplayer
- native apps
- excessive currencies

## Reporting
After meaningful work, report:
1. what changed
2. why
3. files changed
4. schema/API changes
5. tests actually run
6. known limitations
7. recommended next step
