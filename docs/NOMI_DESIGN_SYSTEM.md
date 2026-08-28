# Nomi Design System

**Version:** 1.0  
**Status:** Visual source of truth  
**Product:** Nomi Adaptive Learning Platform  
**Concept:** The Learning Workshop

---

## 1. Purpose

This document defines the visual language of Nomi and is the source of truth for visual implementation across Home, Learn, Practice, Nomi Tutor, Progress, Onboarding, Authentication, Navigation, and shared UI components.

Any coding agent working on Nomi must read this document before making visual changes.

Do not invent new colors, typography roles, icon styles, subject identities, radii, surface treatments, shadows, or interaction patterns when an appropriate rule already exists here. If a required pattern is not defined, extend the system deliberately rather than introducing a one-off convention.

This document governs **presentation**. It does not override product behavior, adaptive-learning logic, mastery or difficulty calculations, interventions, misconception lifecycle, authentication, persistence, Supabase schema/RLS, AI safety boundaries, or canonical curriculum structure.

### Conflict rule

- Product and architecture specifications win for **behavior and data**.
- This design system wins for **visual presentation and interaction styling**.
- A visual refactor must not silently change working product logic.

---

## 2. Brand Idea: The Learning Workshop

Nomi is a warm, intelligent learning environment where difficult ideas become understandable.

The central metaphor is:

> **Learning as exploration, construction, and discovery.**

Educational concepts should feel like things learners can examine, manipulate, connect, test, and gradually understand.

Nomi should feel curious, intelligent, encouraging, calm, spatial, modern, and playful with restraint.

Nomi should **not** feel childish, corporate, clinical, overly futuristic, like a generic SaaS dashboard, like a generic AI chatbot, like a mobile game, or like a collection of white cards on a beige background.

The target visual balance is approximately:

- **60% structural restraint:** whitespace, hierarchy, typography, deliberate composition
- **25% visual energy:** bold moments, color blocking, expressive objects
- **15% Nomi-specific identity:** mascot, subject worlds, educational isometrics

This is an original Nomi system. External products may inform principles, but their layouts, assets, trademarks, or proprietary visual elements must not be copied.

---

## 3. Core Visual Formula

Nomi combines five layers:

1. **Warm editorial foundation**
2. **Bold Nomi purple**
3. **Soft subject-specific color**
4. **Hugeicons functional iconography**
5. **Selective isometric educational objects + Nomi mascot**

The visual rhythm should alternate between expressive moments and calm space:

**Moment → calm → moment → calm**

Not every section should compete for attention.

---

## 4. Color System

### 4.1 Brand colors

| Token | Value | Role |
|---|---|---|
| Nomi Purple | `#7540D8` | Primary brand action and identity |
| Deep Purple | `#5425AE` | Strong brand emphasis, hover/pressed where appropriate |
| Purple Light | `#A77AEF` | Decorative/supporting brand tone |
| Lavender | `#EDE3FF` | Selected/soft brand surfaces |
| Lavender Soft | `#F6F1FF` | Very quiet Nomi context surfaces |
| Ink | `#211D27` | Primary text |
| Slate | `#69636F` | Secondary text |
| Warm Canvas | `#FBF8F3` | Main application background |
| Surface | `#FFFFFF` | Raised content surface |
| Warm Surface | `#F5F0E9` | Quiet secondary surface |
| Border | `#E5DED7` | Neutral separators/borders |
| Disabled Background | `#E7E2EA` | Disabled controls |
| Disabled Text | `#99929E` | Nonessential disabled labels |

### 4.2 Brand color rules

Purple is Nomi's identity color. It should not flood the interface.

Use Nomi Purple for primary CTAs, selected navigation, important Nomi moments, active controls, key focus states, and small areas of brand emphasis.

Use Lavender and Lavender Soft for selected backgrounds, Nomi context, quiet recommendations, and soft highlighted regions.

**Lavender is not a replacement for primary purple.**

A disabled primary action must become visually neutral. Do not create a pale-purple button that looks like a weak active button.

### 4.3 Subject identity

| Subject | Strong | Soft |
|---|---|---|
| Mathematics | `#4D73E6` | `#EAF0FF` |
| Physics | `#F29B45` | `#FFF1DF` |
| Chemistry | `#25A99A` | `#DFF7F3` |
| Biology | `#63A653` | `#EAF6E5` |

Subject colors are for subject icons, subject tiles, subject hero details, small subject indicators, isometric subject artwork, and contextual selected states where the subject is the primary meaning.

Subject colors are **not** for global navigation, generic buttons, error/success states, or random decorative accents.

### 4.4 Semantic colors

| Role | Strong | Soft |
|---|---|---|
| Success | `#177A5E` | `#DDF7EE` |
| Warning | `#8A6500` | `#FFF4C7` |
| Error | `#B5475F` | `#FDE8ED` |
| Info | `#3567C8` | `#EAF0FF` |

Rules:

- Yellow means warning/caution, not error.
- Error states must read as errors.
- Pink is not the default error color merely because it is playful.
- Success should feel encouraging without becoming neon.
- Verify text/background combinations against WCAG AA during implementation.
- Do not rely on color alone to communicate status.

### 4.5 Token implementation

Prefer semantic role tokens over raw color values in components, such as `--color-brand-primary`, `--color-text-primary`, `--color-canvas`, `--color-surface`, `--color-border`, `--color-success`, `--color-error`, and subject role tokens.

Existing tokens should be mapped to these roles where practical. Avoid a destructive rename-only refactor unless necessary.

---

## 5. Typography

**Display / expressive:** Bricolage Grotesque  
**Interface / body:** Inter

Bricolage Grotesque carries Nomi's personality. Inter carries utility and readability.

| Role | Desktop | Mobile | Family |
|---|---:|---:|---|
| Page title | 40–44px | 30–34px | Bricolage Grotesque |
| Section title | 24–28px | 22–24px | Bricolage Grotesque |
| Feature/card title | 18–20px | 18–20px | Bricolage or Inter semibold |
| Body | 15–16px | 15–16px | Inter |
| Metadata | 13–14px | 13–14px | Inter |
| Eyebrow | 11–12px | 11–12px | Inter |

Rules:

- Use Bricolage for meaningful hierarchy, not every label.
- Use Inter for controls, metadata, answers, navigation, form fields, and longer copy.
- Page titles should feel editorial rather than dashboard-like.
- Avoid excessive uppercase.
- Purple uppercase eyebrows are reserved for major transitions or genuinely useful category labels.
- Do not add an eyebrow above every heading.
- Learning explanations should prioritize readability over visual density.

---

## 6. Spacing and Layout

Use a 4px base spacing system with preferred steps:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`

### Page gutters

- Mobile: 16px minimum
- Larger mobile/tablet: 20–24px
- Desktop content: 32px where space permits

### Content widths

- Focused Practice: approximately `640px`
- Tutor conversation / reading: approximately `720–760px`
- General Home/Learn/Progress content: approximately `1040px`

Use additional desktop width for composition and whitespace, not to fill the page with more cards.

Preserve the existing responsive shell, desktop sidebar behavior, mobile bottom navigation, and safe-area handling unless a dedicated navigation milestone changes them.

---

## 7. Radius System

| Role | Radius |
|---|---:|
| Small control | 10px |
| Input / answer option | 14px |
| Standard card/surface | 18px |
| Feature surface | 24px |
| Pill/chip | 999px |

Stop rounding every element identically. Large radius should signal importance or softness, not be applied indiscriminately.

---

## 8. Surface Hierarchy

### Level 0: Canvas

No card. Use for page headings, Tutor welcome content, Nomi conversational recommendations, curriculum grouping, explanatory copy, and Practice question composition.

Use Level 0 more often than the current UI does.

### Level 1: Soft Surface

Tinted or warm background with little or no shadow. Use for recommendations, subject context, explanatory information, selected subject worlds, and quiet callouts.

### Level 2: Raised Surface

White surface, defined border, very subtle shadow when necessary. Use for active controls, composer, important form areas, and focused interactive modules.

### Level 3: Brand Surface

Purple or subject-color-led surface used sparingly. Use for primary learning CTAs, Continue Learning hero, important progress moments, and small high-value hero areas.

Avoid card-inside-card layouts, a white rectangle around every section, and heavy shadow as the only hierarchy mechanism. Prefer whitespace, typography, alignment, background shifts, selective color, and scale.

---

## 9. Elevation

Nomi is primarily flat-to-soft.

- Level 0: no shadow
- Level 1: no shadow or nearly imperceptible shadow
- Level 2: subtle soft shadow
- Floating controls/composer: slightly stronger but restrained

Avoid dramatic drop shadows, colored glow, purple glow, neumorphism, and glassmorphism.

---

## 10. Iconography

Use **Hugeicons Stroke Rounded** for core functional UI.

Free packages:

- `@hugeicons/react`
- `@hugeicons/core-free-icons`

Do not require paid Hugeicons styles unless the repository has an explicit license.

Create one application-level `AppIcon` wrapper to standardize size, stroke width, color, and accessibility behavior. Use named icon imports for tree shaking. Do not use wildcard imports. Use `currentColor` wherever practical.

Stroke guidance:

- Navigation: `2`
- Primary functional controls: `2`
- Small metadata: `1.5`
- Large UI-supporting icons: `1.5–2`

Selected navigation uses a Nomi Purple icon, Ink label, and pale Lavender background. Unselected navigation should be visually quieter.

Decorative icons use `aria-hidden="true"`. Icon-only controls require an accessible label.

### Migration from Lucide

- Do not add new Lucide usage.
- Replace core product Lucide icons with Hugeicons equivalents.
- Do not keep two competing icon languages in the same interface.
- Remove the Lucide dependency only after verifying no imports remain.
- If no suitable Hugeicons equivalent exists, document the exception rather than silently introducing another library.

---

## 11. Subject Visual Language

Each subject has two layers:

1. **Functional:** Hugeicons Stroke Rounded icon.
2. **Expressive:** lightweight isometric educational composition.

These are not interchangeable.

### Mathematics
Cubes, coordinate planes, geometric solids, equations, grids, graph fragments.

### Physics
Orbit, pendulum, vector arrows, trajectory, force diagrams, motion paths.

### Chemistry
Molecules, flask, bonds, crystal structures, atomic arrangements.

### Biology
Leaf, cell, DNA, organic structures, membranes, cellular forms.

---

## 12. Isometric Illustration System

Isometric objects are part of Nomi's educational identity, not generic decoration.

Style:

- Approximately 30° / isometric perspective
- Simple geometry
- Mostly flat faces
- 2–3 tones per object
- Rounded edges where appropriate
- Extremely soft shadows
- Occasional floating elements
- Generous negative space
- Editorial diagram quality

Think **educational objects arranged spatially**, not glossy game assets.

Prefer original SVG, lightweight CSS geometry, simple reusable vector compositions, and locally stored assets. Do not silently introduce externally licensed illustration packs or runtime dependencies on third-party illustration CDNs.

Use isometric artwork selectively in Home Continue Learning, subject exploration, Onboarding, meaningful empty states, Progress reflection, and occasional Nomi learning moments.

Do not use isometric artwork for navigation icons, every card, generic buttons, form controls, or active Practice questions where it distracts from the task.

---

## 13. Nomi Mascot

Nomi is the AI learning companion, not a decorative logo.

When Nomi appears, the learner should understand that Nomi is speaking, reacting, encouraging, thinking, recommending, or helping.

Current character foundation: rounded purple shape-shifting companion, white face area, simple dark oval eyes, small rounded limbs/bumps, and occasional mint/yellow accents.

Core states:

- Neutral
- Thinking
- Curious
- Encouraging
- Celebrating
- Reinforcing
- Challenge
- Supportive

Recommended sizes:

- Hero: 64–80px+
- Recommendation: 40–48px
- Tutor avatar: 32–36px
- Inline feedback: 28–32px

The mascot's state must correspond to a meaningful product state. Do not use random emotional reactions disconnected from learner behavior.

---

## 14. Motion

Full mascot and educational-object motion belongs to a dedicated motion milestone.

Until then, keep motion restrained: approximately 160–220ms for hover, focus, pressed, opacity, and small surface transitions.

Future motion may include subtle floating educational objects, Nomi reactions, correct-answer settle/pop, and progress state transitions.

Avoid constant bouncing, infinite attention-seeking motion, large parallax, excessive springs, or animation that slows Practice. Respect `prefers-reduced-motion`.

---

## 15. Component Principles

Shared components should encode the visual system so individual screens do not recreate it.

Recommended primitives:

- `Button`
- `IconButton`
- `StatusBadge`
- `Eyebrow`
- `SectionHeader`
- `SubjectIcon`
- `AppIcon`
- `FeedbackBanner`
- `ContextChip`
- `EmptyState`

A generic `Card` primitive is optional. Do not force every content block into it.

---

## 16. Buttons

### Primary

Nomi Purple background, high-contrast foreground, clear hover/pressed/focus states. Use for the single dominant local action.

### Secondary

Neutral/white or soft surface, defined border, Ink text, minimal shadow.

### Tertiary

Low-emphasis text/icon treatment without creating another card-like control.

### Disabled

Disabled controls must look clearly inactive. Use neutral disabled tokens rather than pale brand purple.

---

## 17. Status Badges and Chips

Badges communicate state. Chips communicate compact context or selectable information. Do not use pills as generic decoration.

Valid learner-facing states include:

- Not started
- In progress
- Needs practice
- Strong

Do not expose raw mastery percentages unless product requirements explicitly call for them, internal intervention codes, database identifiers, or model/debug terminology.

---

## 18. Feedback

Practice and Tutor feedback should feel like Nomi responding to learning, not a system alert console.

### Correct

Use semantic success treatment. Positive but calm. Nomi may celebrate. Avoid excessive confetti.

### Incorrect

Use semantic error treatment and supportive language. Do not reveal the correct answer if product logic requires retry first. Avoid punitive red-heavy screens.

### Warning

Use warning colors for caution, incomplete state, or attention. Do not reuse warning yellow for errors.

### Adaptive explanation

Make adaptation visible through concise learner-facing language where useful, for example:

> You've got two in a row. This one's a little tougher.

> This concept has tripped you up twice, so we're simplifying the next example.

> You're cruising through these. Ready for a stretch?

Do not expose hidden reasoning or chain-of-thought.

---

## 19. Screen Direction

### 19.1 Home

Home should feel like a personal learning starting point, not a dashboard.

Order:

1. Greeting + Nomi
2. Continue Learning hero
3. Nomi recommendation
4. Explore subjects
5. Recent learning

**Continue Learning** should be the strongest visual object. Prefer an asymmetric feature surface: learning context and CTA on the left, small isometric subject composition on the right. Avoid nested white cards.

**Nomi recommendation** should feel conversational: avatar + message directly on canvas or a quiet soft surface, with one action when relevant.

**Explore subjects** uses four compact subject tiles with subject color, Hugeicon, name, and optional tiny geometric motif. Tiles do not need to be white.

Keep **Recent learning** visually quiet.

### 19.2 Practice

Practice is a focus environment. The page itself should become the learning surface.

Order:

1. Compact subject/topic context
2. Large question
3. Answer area
4. Action
5. Nomi feedback/adaptation

Avoid one giant white quiz card floating inside the page.

Answer options should be tactile: neutral default, 14px radius, clear border, comfortable target. Selected options use a clear outline and subtle fill. Correct uses semantic success; incorrect uses soft semantic error.

Do not place decorative isometric artwork next to an active question unless it is instructional.

### 19.3 Nomi Tutor

The Tutor must not look like ChatGPT embedded inside Nomi.

First visit should use a Nomi canvas rather than a giant enclosing card: expressive Nomi presence, optional low-opacity educational objects, short title, supportive explanation, prompt suggestions, and the composer as the primary raised surface.

Preserve the established two-state model: **welcome state → active learning dialogue**.

Once conversation begins, the welcome hero disappears, the thread becomes primary, and the composer stays easy to access. Avoid WhatsApp/iMessage styling and exaggerated generic chat bubbles.

### 19.4 Learn

Learn is curriculum exploration, not a settings list.

Hierarchy: **Subject → Unit → Topic → State**.

Communicate hierarchy primarily through typography, spacing, grouping, background, and small state indicators rather than nested rectangles.

Use subject identity carefully in the selector/header. Units should be borderless or lightly separated groups. Topics should be compact interactive rows rather than full cards.

### 19.5 Progress

Progress should feel reflective and editorial rather than analytical.

Framing:

> **Here is what Nomi understands about your learning.**

Preserve the existing information architecture: Subjects, What you're working on, Next up, Recent learning.

The top area may combine Nomi, a short summary, and 2–3 qualitative learning indicators.

Avoid fake analytics, decorative charts without evidence, invented percentages, and enterprise-dashboard KPI cards.

### 19.6 Onboarding

Preserve the existing three steps:

1. Welcome
2. Choose subject
3. Ready

Subject selection should use a responsive 2×2 visual grid where space permits. Each subject option may include an isometric subject object, Hugeicon, name, short description, and subject-specific accent.

Selected state: stronger subject-colored border, soft subject background, and clear check indicator.

The Ready step should build a small visual world around the selected subject. It should feel like entering a subject, not completing an account setup wizard.

### 19.7 Authentication

Keep authentication simple. Use typography, a small mascot moment, warm canvas, controlled purple, and excellent spacing. Do not turn sign-in/sign-up into a large marketing landing page.

---

## 20. Navigation

Desktop navigation should remain calm and persistent.

Selected item:

- Pale Lavender background
- Purple Hugeicon
- Ink text
- Clear focus state

Unselected items should remain minimal and visually quieter.

Mobile bottom navigation remains the primary shell navigation: Home, Learn, Nomi, Progress. Practice is entered through contextual learning actions rather than permanent mobile navigation. Respect safe-area insets.

---

## 21. Accessibility

Requirements:

- Minimum practical touch target: 44×44px
- Visible keyboard focus
- Semantic HTML first
- Icon-only controls require accessible names
- Decorative imagery hidden from assistive technology
- State cannot rely solely on color
- Text/background combinations should meet WCAG AA
- Respect reduced-motion preferences
- Maintain logical heading order
- Do not reduce text contrast merely to achieve a softer aesthetic
- Error messages should explain the problem in text
- Selected answer states need more than a subtle color change

---

## 22. Responsive Behavior

Nomi is mobile-first.

On mobile prioritize one task, one dominant action, comfortable touch targets, clear vertical rhythm, and minimal decorative competition.

On desktop use additional width for better composition, whitespace, supporting visuals, and side-by-side feature moments. Do not fill every available pixel with cards.

---

## 23. Empty States

Empty states should explain what the learner can do next.

Use a concise title, useful explanation, one primary action when applicable, and Nomi or a small educational visual only when meaningful.

Do not fabricate content to avoid an empty screen. A truthful empty state is better than fake learning history.

---

## 24. Loading and Error States

Loading should preserve layout stability. Prefer small skeletons, reserved space, or a Nomi thinking state where contextually appropriate.

Errors should use semantic error treatment, explain what failed in learner-friendly language, and offer retry when valid.

Never expose provider errors, API keys, stack traces, Supabase details, or raw provider payloads to learners.

---

## 25. Content Tone

Nomi's voice is warm, clear, encouraging, specific, occasionally witty, and never condescending.

Prefer:

> Let's try a simpler version first.

Over:

> Oops! Looks like you're struggling!

Prefer:

> You've been strong on these. Let's raise the challenge.

Over exaggerated praise.

Celebrate progress without infantilizing the learner. Avoid emoji as a substitute for the visual system.

---

## 26. Visual Anti-Patterns

Do not introduce:

- Glassmorphism
- Neon AI gradients everywhere
- Excessive purple
- Rainbow interfaces
- Emoji subject icons
- Glossy 3D emoji-style illustrations
- Childish classroom cartoons
- Giant dashboard grids
- Fake analytics
- Gradients on every CTA
- Cards around every section
- Excessive shadows
- AI sparkle icons everywhere
- Random blobs unrelated to Nomi
- Multiple icon libraries
- Arbitrary one-off colors
- Hard-coded visual values when a token exists
- Excessive uppercase labels
- Decorative badges with no semantic meaning
- Border-heavy nested layouts
- ChatGPT-style Tutor clones

---

## 27. Visual Hierarchy Test

Before considering a screen complete, ask:

1. What is the first thing the learner should notice?
2. Is there one clear primary action?
3. Can any border/card be removed without losing comprehension?
4. Is purple being used because it has meaning or merely because Nomi is purple?
5. Does the subject color communicate subject identity?
6. Is the mascot present for a reason?
7. Is illustration helping orientation or distracting from learning?
8. Does the page still work without fake data?
9. Does the interface feel like a learning environment rather than SaaS?
10. Is the screen clearly part of the same product as every other Nomi screen?

If everything has equal visual weight, the hierarchy is wrong.

---

## 28. Implementation Rules for Coding Agents

Before changing a screen:

1. Read this file.
2. Inspect existing shared components.
3. Inspect existing product behavior and tests.
4. Reuse or extend the shared system.
5. Preserve data and adaptive logic.
6. Implement responsive states.
7. Verify accessibility.
8. Run lint, typecheck, tests, and build.
9. Visually inspect the result at mobile and desktop widths.

Do not rewrite working domain logic during a visual milestone, change canonical curriculum names for aesthetic reasons, add fake progress data, add AI calls merely to make visual states dynamic, expose UUIDs/internal reason codes, create a second design system inside a page, add third-party visual assets without documenting licensing/source, or replace real empty states with fabricated content.

---

## 29. Migration Strategy

### Phase 1: Foundation

- Add/update semantic tokens
- Install Hugeicons free React packages
- Add shared `AppIcon`
- Normalize typography, radii, spacing, semantic feedback
- Remove dead visual classes

### Phase 2: Shared components

Normalize Button, IconButton, StatusBadge, Eyebrow, SectionHeader, SubjectIcon, FeedbackBanner, ContextChip, and EmptyState.

### Phase 3: Core screens

Refactor in this order:

1. App shell/navigation
2. Home
3. Practice
4. Learn
5. Nomi Tutor
6. Progress
7. Onboarding
8. Authentication

### Phase 4: Educational visual layer

Introduce lightweight original subject isometrics. Do not block functional visual cleanup on perfect illustrations.

### Phase 5: Motion

Add Nomi and educational-object motion only after static visual hierarchy is correct.

---

## 30. Definition of Done

A visual-system milestone is not complete merely because tokens or shared components exist. The actual product must visibly reflect the system.

Verify:

- [ ] Hugeicons is the core functional icon language
- [ ] No competing emoji subject icon system remains
- [ ] Subject colors are consistent
- [ ] Brand purple is controlled
- [ ] Disabled states are neutral and legible
- [ ] Errors and warnings are visually distinct
- [ ] Pages use canvas space instead of unnecessary cards
- [ ] Radius hierarchy is visible
- [ ] Typography hierarchy is visible
- [ ] Home has a clear Continue Learning visual anchor
- [ ] Practice feels focused
- [ ] Learn reads as curriculum exploration
- [ ] Tutor does not resemble a generic chatbot
- [ ] Progress does not resemble an analytics dashboard
- [ ] Onboarding establishes subject identity
- [ ] Nomi appears meaningfully
- [ ] No fake analytics or fabricated learner data
- [ ] Mobile and desktop layouts both feel intentionally designed
- [ ] Keyboard focus and touch targets are usable
- [ ] Reduced-motion behavior remains safe
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Production build passes

---

## 31. Final Principle

When choosing between adding more UI and improving composition, choose composition.

When choosing between another card and whitespace, try whitespace first.

When choosing between decorative purple and meaningful subject identity, choose meaning.

When choosing between generic AI aesthetics and educational clarity, choose educational clarity.

Nomi should not merely look polished.

**It should look like a product that understands learning.**
