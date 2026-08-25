# Nomi Product Specification v1.0

> **Nomi — Learns how you learn.**

## Product Summary
Nomi is a **mobile-first adaptive AI learning companion**.

It learns from measurable student behaviour and continuously adapts:
- question difficulty
- explanation style
- practice sequence
- remediation
- challenge level
- revision recommendations

**The core product is not AI chat. The core product is the adaptive learning loop.**

## Platform
### V1
Mobile-first responsive Progressive Web App.

Primary design target: approximately 360–430px smartphone width.

Also support tablet and desktop. Desktop expands the learning experience rather than turning it into a traditional SaaS dashboard.

### Future
Native iOS/Android may follow after validation, potentially with React Native + Expo. Keep domain logic reasonably portable.

## Initial Learners
Initial focus:
- secondary-school learners
- core academic subjects
- students who benefit from personalized explanations and practice

Initial subjects may include Mathematics, Physics, Chemistry, and Biology. Do not hard-code the architecture around only these subjects.

## Product Promise
Nomi continuously answers:

> **What should this learner encounter next, and why?**

## Core Loop
```text
Learner action
    ↓
Measurable performance
    ↓
Learner state updated
    ↓
Adaptive engine evaluates state
    ↓
Intervention selected
    ↓
Nomi changes the experience
    ↓
Learner acts again
```

## V1 Experiences

### Authentication
Sign up, sign in, sign out, and appropriate account recovery. Supabase Auth is preferred.

### Onboarding
Should feel like meeting Nomi rather than completing administration.

Potential inputs:
- preferred name
- age/year/grade
- subjects
- goals
- preferred learning approaches
- daily study target

Finish with a lightweight baseline/diagnostic.

### Home
Answers:
1. What should I do now?
2. Why this?
3. How am I progressing?

Show a primary recommendation, concise reason, progress, relevant streak/reward, and meaningful adaptive insight. Avoid dashboard overload.

### Learn
Subject/topic discovery and clear paths into lessons/practice. It should feel like learning progress, not a file directory.

### Adaptive Practice
Primary source of quantitative learning evidence.

Each attempt can include:
- subject
- authoritative parent topic
- concept/subskill
- difficulty 1–10
- question
- possible answers/structured response
- expected answer
- selected/entered answer
- correctness
- response time
- misconception classification
- timestamp

After meaningful attempts update learner state and choose the next intervention.

### Nomi Tutor
Nomi can explain, guide step by step, ask questions, give hints, change explanation strategy, use relevant prior learning state, recommend targeted practice, and summarize sessions.

Ordinary chat must not arbitrarily alter quantitative mastery.

### Progress
Prioritize understandable progress:
- subject/topic mastery
- recent improvement
- reinforcement needs
- strengths
- misconception state
- practice history
- milestones

### Profile/Settings
Essential account and learning preferences only.

## Navigation
Initial mobile IA:
```text
Home
Learn
Nomi
Progress
```

Use bottom navigation on mobile. Profile/settings can live behind a profile control.

## Shared Learner State
Practice, Tutor, Home, and Progress must share one model.

Topic-level state may include:
```text
user
subject
topic
mastery
recent_accuracy
difficulty
attempted
correct
consecutive_correct
consecutive_incorrect
confidence (when measured)
common_misconceptions
preferred_explanation_style
last_practiced_at
recommended_intervention
```

## Topic Integrity
Parent topic is authoritative.

Example:
```text
Subject: Mathematics
Topic: Quadratic equations
Concept: Factorisation
```

AI may choose/classify concepts but must not silently rename an explicitly selected parent topic.

## Adaptive Engine
Use deterministic calculations where practical.

Difficulty: 1–10.

Initial rules:
```text
2 consecutive correct
→ difficulty +1

3 consecutive correct
→ difficulty +1 and challenge

1 incorrect
→ difficulty stable
→ targeted explanation

2 consecutive incorrect
→ difficulty -1
→ remediation

repeated misconception
→ concept-focused remediation

minimum difficulty = 1
maximum difficulty = 10
```

Keep this logic isolated and unit-testable.

## Interventions
Initial internal states:
```text
reinforce
guided_practice
remediation
standard_practice
challenge
review
```

Prefer deterministic selection. AI generates content appropriate to the selected intervention.

## Misconceptions
Initial categories:
```text
conceptual_understanding
calculation_error
terminology_confusion
skipped_step
careless_mistake
missing_prerequisite
unknown
```

Persist enough information to distinguish active, recurring, and improving/resolved misconceptions. Never persist hidden chain-of-thought; store concise signals only.

## AI Responsibilities
AI:
- question generation
- tutoring
- explanations
- hints
- concise misconception classification
- summaries
- natural-language learning insights

Deterministic application logic:
- difficulty
- mastery
- counters
- intervention thresholds
- topic identity
- authorization
- ownership
- validation
- routing

## Visible Adaptation
Meaningful examples:

> **Difficulty increased**  
> You've got two in a row. This one's a little tougher.

> **Let's reinforce this**  
> Factorisation has tripped you up twice, so we'll simplify the next example.

> **Challenge unlocked**  
> You're cruising through these. Ready for a stretch?

Do not display adaptation messaging after every interaction.

## Gamification
V1 may include:
- streak
- XP/points
- progress celebrations
- achievements
- daily goal

Gamification supports learning rather than replacing it.

Avoid leaderboards, social competition, punishment, manipulative streak guilt, reward spam, and excessive currencies in V1.

## Data Direction
Preferred backend: Supabase.

Expected domains:
- profiles
- learner subjects
- topic progress
- practice attempts
- misconception state
- learning sessions
- tutor conversations/messages
- minimal achievement/streak state as needed

Requirements:
- authenticated ownership
- RLS
- useful indexes
- committed migrations
- no client-side secrets

Exact schema should be planned before implementation.

## Technical Direction
Preferred:
- React
- TypeScript
- Tailwind CSS
- accessible component primitives
- PWA support

OpenCode should propose and justify the exact React framework before implementation.

Separate domain logic from UI.

Conceptual modules:
```text
features/
  onboarding/
  home/
  learn/
  practice/
  tutor/
  progress/

adaptive/
  learner-state
  difficulty
  mastery
  misconceptions
  interventions

ai/
  tutor
  questions
  classifier
```

## Mobile UX
- mobile first
- large touch targets
- bottom navigation
- one primary task per screen
- thumb-friendly actions
- short feedback loops
- minimal typing during practice where practical
- correct keyboard/safe-area handling
- responsive layouts
- never compress a desktop dashboard onto mobile

## PWA
Eventually support installable manifest, icons/splash assets, standalone display, graceful app-shell behavior, and useful error/offline states. Do not attempt complex offline AI tutoring in V1.

## Out of Scope
Do not add without approval:
- leaderboards
- social feeds
- parent portal
- teacher portal
- classroom administration
- certificates
- marketplace
- AI avatars
- voice tutor
- multiplayer
- video calls
- native mobile apps

## V1 Proof
A reviewer should experience:
1. meet Nomi
2. establish baseline
3. practice
4. measurable performance is recorded
5. learner succeeds or struggles
6. state changes
7. next experience visibly adapts
8. Tutor understands the same state
9. Home/Progress reflect it

Success statement:

> **Nomi changed how it taught me because of what I did.**
