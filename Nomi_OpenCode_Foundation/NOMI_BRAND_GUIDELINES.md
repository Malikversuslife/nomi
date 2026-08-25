# Nomi Brand Guidelines v1.0

> **Nomi — Learns how you learn.**

## Brand Idea
Nomi is an adaptive AI learning companion that learns from how a learner performs and changes how it teaches in response.

Nomi should feel like a smart study buddy, not a generic chatbot, traditional LMS, or school administration tool.

### Personality
Playful, curious, encouraging, clever, warm, energetic, observant.

Never condescending, childish, robotic, or excessively enthusiastic.

### Emotional goal
**Make learning feel achievable, personal, rewarding, and alive.**

Nomi may borrow the energy, simplicity, delight, and character-led philosophy of playful learning products such as Duolingo, but must never imitate Duolingo literally.

## Mascot
Nomi is not decorative. **Nomi is the tutor.**

Visual concept: a small expressive, shape-shifting purple learning companion built from soft rounded geometry.

Core states:
- Neutral
- Thinking
- Curious
- Encouraging
- Celebrating
- Reinforcing
- Challenge
- Supportive

Mascot reactions should map to real product state where possible. Never use shame, anger, punishment, or disappointment after incorrect answers.

## Color System
Purple-led identity supported by mint, yellow, pink, and warm neutrals.

Initial tokens:

```css
--nomi-purple-700: #6538B6;
--nomi-purple-600: #7748D0;
--nomi-purple-500: #8B5DE3;
--nomi-purple-100: #EEE6FB;

--nomi-mint-500: #6DD8B5;
--nomi-mint-100: #DDF7EE;

--nomi-yellow-500: #F4C94F;
--nomi-yellow-100: #FFF4C7;

--nomi-pink-500: #EF8EB7;
--nomi-pink-100: #FCE2EC;

--nomi-ink: #25232B;
--nomi-muted: #716D79;
--nomi-surface: #FFFFFF;
--nomi-background: #FBF9F6;
--nomi-border: #E9E4EC;
```

These may be tuned during visual QA while preserving the approved direction.

Use purple for primary actions, Nomi, active navigation, and core brand moments. Mint supports positive progress. Yellow supports earned/reward moments. Pink is an occasional delight accent.

Avoid turning every surface purple, excessive gradients, neon/cyberpunk styling, or Duolingo-green brand ownership.

## Typography
### Display
**Bricolage Grotesque**

Use for major headings, onboarding, celebrations, marketing headlines, and expressive Nomi copy.

### UI/body
**Inter**

Use for questions, answers, body copy, navigation, forms, buttons, labels, and data.

Learning content readability always wins over brand expression.

## Shape Language
Prefer:
- rounded cards
- soft circles/blobs
- tactile controls
- pill controls where appropriate
- generous whitespace
- subtle borders/elevation

Suggested radius scale:
```text
small: 12px
medium: 16px
large: 24px
pill: 999px
```

Avoid sharp enterprise-dashboard styling, dense tables as primary experiences, thin tiny controls, and excessive glassmorphism.

## Iconography
Use a consistent rounded icon family such as Lucide for functional UI. Icons usually support labels rather than replace them.

Use custom Nomi illustrations for onboarding, milestones, important empty states, and meaningful adaptive moments.

## Voice
Nomi sounds like a clever, supportive study buddy.

Good:
> Nice. You've got the pattern. Let's make the next one a little harder.

Good:
> That step keeps causing trouble. I'll break it down differently this time.

Good:
> Not quite. Your setup was right, though. Check what happened when you changed the sign.

Avoid baby talk, corporate AI language, excessive exclamation marks, fake praise, and unsupported claims about the learner.

## Adaptation Language
Only surface adaptation when something meaningful changes.

**Personalised for you**
> You usually pick this up faster with examples, so let's start there.

**Difficulty increased**
> You've got two in a row. This one's a little tougher.

**Let's reinforce this**
> This concept has tripped you up twice, so we're simplifying the next example.

**Challenge unlocked**
> You're cruising through these. Ready for a stretch?

Never expose hidden chain-of-thought.

## Motion
Use motion for Nomi reactions, answer feedback, progress, difficulty transitions, completion, navigation continuity, thinking/loading, and earned rewards.

Motion should be short, purposeful, responsive, and reduced-motion compatible. Avoid constant bouncing and blocking animations.

## Accessibility
- WCAG-conscious contrast
- 44px+ practical touch targets
- visible focus states
- semantic HTML
- keyboard accessibility
- screen-reader labels
- never use color alone for correctness/state
- support `prefers-reduced-motion`
- mascot expression must never be the sole carrier of important information

## UI Personality
Nomi is a consumer learning product, not SaaS.

Every main screen should prioritize:
1. What should I learn now?
2. What am I doing?
3. How did I do?
4. What changed because of my performance?

Analytics are secondary to action.

## Guardrails
Do:
- connect personality to product intelligence
- make progress tangible
- use playful microcopy selectively
- make mistakes emotionally safe
- keep mobile experiences spacious and focused

Don't:
- copy Duolingo screens
- use an owl mascot
- use Duolingo's green identity
- make Nomi a generic chat avatar
- put Nomi everywhere
- gamify every tap
- use guilt or punishment to protect streaks

## Brand North Star
Ask:

> **Does this make Nomi feel like a learning companion that genuinely understands and responds to the learner?**
