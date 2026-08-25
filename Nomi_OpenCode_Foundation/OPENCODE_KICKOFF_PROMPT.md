# Nomi — OpenCode Kickoff Prompt

You are beginning a new implementation of **Nomi**, a mobile-first adaptive AI learning companion.

Before writing application code:

1. Read `AGENTS.md`.
2. Read `NOMI_BRAND_GUIDELINES.md`.
3. Read `PRODUCT_SPEC.md`.
4. Inspect the current repository completely.
5. Do not assume an architecture until you understand what already exists.

## Task
**Plan the V1 technical foundation only. Do not implement the full product yet.**

Propose:
- frontend framework and justification
- PWA approach
- routing
- UI/component strategy
- styling/token architecture
- Supabase integration
- authentication architecture
- database/domain model
- AI integration boundary
- adaptive-engine architecture
- shared learner-state architecture
- testing strategy
- environment-variable strategy
- source tree
- development milestones

## Constraints
- Mobile-first PWA is canonical V1.
- React + TypeScript preferred.
- Supabase preferred.
- Tailwind CSS preferred.
- Nomi must not become a generic chatbot or SaaS dashboard.
- Adaptive calculations should be deterministic and testable.
- LLM functionality should sit behind clear server-side boundaries.
- Practice, Tutor, Home, and Progress share one learner-state model.
- Never expose/persist hidden chain-of-thought.
- No native iOS/Android in V1.
- Respect all out-of-scope items in `PRODUCT_SPEC.md`.

## Database Planning
Design the minimum clean schema for:
- profiles
- learner subjects
- topic progress
- practice attempts
- misconception state
- learning/study sessions
- tutor threads/messages

For each explain:
- purpose
- important fields
- relationships
- ownership/RLS
- useful indexes

Do not create migrations during this planning step.

## Adaptive Engine Planning
Explain exactly where these live:
```text
difficulty calculation
mastery calculation
recent accuracy
consecutive-answer state
misconception lifecycle
intervention selection
learner-state derivation
question generation
tutor response generation
```

Clearly separate deterministic application logic from AI responsibilities.

## UI Planning
Propose the initial shell:
```text
Home
Learn
Nomi
Progress
```

Explain mobile bottom navigation and desktop adaptation. Do not design dozens of screens yet.

## Deliverable
Return:
1. Architecture decision
2. Technology choices
3. Source tree
4. Database model
5. Adaptive engine design
6. AI boundary
7. UI foundation
8. PWA approach
9. Testing approach
10. Security considerations
11. Milestone sequence
12. Risks/tradeoffs
13. Only genuinely blocking questions

**Do not start implementation until the plan has been reviewed and approved.**
