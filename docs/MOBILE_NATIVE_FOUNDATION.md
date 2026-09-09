# Nomi Mobile — Native Foundation

Status: Milestone 1
Target: Apple App Store + Google Play

## Product decision

Nomi Mobile is a true native application, not a wrapped webview and not a separate product direction. It reuses the existing Nomi product model, adaptive-learning rules, Supabase backend, curriculum, brand tokens, and companion behavior system while implementing a mobile-native presentation layer.

## Mobile stack

- Expo + React Native + TypeScript
- Expo Router for navigation
- Supabase for auth, profiles, curriculum, progress, and practice persistence
- Rive for the Nomi companion and later side-character state machines
- Shared deterministic adaptive-learning logic from the existing Nomi domain layer

## Product navigation

Primary tabs:

1. Home
2. Learn
3. Nomi
4. Practice
5. Progress

Nomi sits in the visual center of the tab system, but remains a functional destination rather than decorative navigation.

## First vertical slice

The first real product loop is intentionally narrow: Mathematics → Factorisation.

1. Welcome
2. Learning goal
3. Subject selection
4. Home / Continue Factorisation
5. Short lesson
6. Practice question
7. Incorrect answer
8. Thinking Nomi
9. Worked example
10. Retry
11. Encouraging Nomi
12. Increased challenge
13. Mastery update
14. Progress reflection

The purpose of this slice is to prove the core Nomi proposition before broadening the curriculum.

## Adaptive interaction contract

The mobile app must not independently decide mastery, difficulty, misconception identity, or intervention strategy.

The existing deterministic domain remains authoritative for:

- mastery updates
- difficulty selection
- learner-state derivation
- misconception lifecycle
- intervention choice
- next-question selection

The mobile app renders those decisions and maps them to appropriate companion behavior.

## Nomi behavior mapping

| Product event | Companion state |
| --- | --- |
| Resting / waiting | Idle |
| New concept or learner exploration | Curious |
| System/AI processing | Thinking |
| Correct answer / good effort | Encouraging |
| Learner struggling | Supportive |
| Difficulty increases | Challenge |
| Repetition / habit strengthening | Reinforcing |
| Mastery milestone | Celebrating |
| Greeting | Wave |
| Attention cue | Point |

Rive is integrated after the core shell is stable. Until the final `.riv` asset exists, mobile components should expose semantic companion-state props so placeholder art can be swapped without changing product logic.

## Visual system

Canonical palette:

- Primary Purple: `#6C3CFF`
- Mint: `#2DD4A1`
- Yellow: `#FFD43B`
- Pink: `#FF8AAE`
- Lavender: `#E9E6FF`
- Ink: `#111827`
- Slate: `#475569`
- Stone: `#F2F2F7`
- Cream: `#FFF9F2`
- White: `#FFFFFF`

Typography:

- Bricolage Grotesque: expressive headings
- Inter: interface and supporting text
- Nomi wordmark: custom asset only

The mobile UI should use the quieter product side of the identity: Cream canvas, White surfaces, Ink content, restrained Purple actions, Lavender learning states, Mint success/progress, Yellow achievement, Pink supportive warmth.

## Repository strategy

For Milestone 1, keep the current Next.js application intact and add the native application under `mobile/`.

Do not move the existing web application into a monorepo structure during the initial native bootstrap. Shared packages can be extracted only after the native shell is running and the actual cross-platform boundaries are known.

Planned structure:

```text
nomi/
├── src/                  # existing Next.js web product
├── mobile/               # Expo / React Native application
├── docs/
├── supabase/
└── ...
```

Later, safe shared domain modules may move into `packages/` if both clients require them directly.

## Milestone 1 acceptance criteria

The foundation is complete when:

- the Expo application boots on iOS and Android
- TypeScript strict mode is enabled
- five primary tab routes exist
- canonical design tokens are implemented
- Bricolage Grotesque and Inter load correctly
- Supabase client/session plumbing exists for native
- authenticated and unauthenticated navigation boundaries are defined
- semantic Nomi companion states are represented in code
- the first Home, Learn, Nomi, Practice, and Progress shells render
- no adaptive-learning rules are duplicated in UI components
- basic lint/typecheck scripts pass

## Non-goals for Milestone 1

Do not add yet:

- multiple fully functioning subjects
- social features
- parent/teacher dashboards
- marketplace features
- complex achievements economy
- final Rive rig
- camera/document solving
- voice tutor
- offline curriculum synchronization
- production push notifications

Those become later milestones after the learning loop is proven.
