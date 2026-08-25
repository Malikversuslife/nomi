# Adaptive Engine V1

Milestone 3 implements deterministic domain logic only. It does not call AI, generate questions, mutate Supabase, or implement practice/tutor UI.

## Mastery Formula

Mastery is normalized to `0-100` and calculated from the current persisted mastery plus up to the last 16 attempts.

For each attempt:

```text
delta = correctness_sign
  * difficulty_weight
  * performance_weight
  * easy_repeat_weight
  * mistake_protection_weight
  * recency_weight
  * 4

correctness_sign:
  correct   = +1
  incorrect = -1.2

difficulty_weight:
  0.6 + difficulty / 10

performance_weight:
  previous recent weighted accuracy >= 80% = 1.1
  previous recent weighted accuracy >= 50% = 1.0
  previous recent weighted accuracy < 50%  = 0.9

easy_repeat_weight:
  correct, difficulty <= 3, current mastery >= 70 = 0.45
  otherwise = 1.0

mistake_protection_weight:
  incorrect, current mastery >= 75 = 0.6
  otherwise = 1.0

recency_weight:
  0.7 for the oldest considered attempt, rising to 1.0 for the newest

next_mastery:
  clamp(round(current_mastery + delta), 0, 100)
```

Tradeoffs:

- This is intentionally simple and explainable rather than a hidden ML model.
- It rewards harder correct answers more than easy answers.
- It reduces the value of repeated easy success after mastery is already substantial.
- It protects substantial mastery from being erased by one isolated mistake.
- It weighs recent attempts more than old attempts.

## Difficulty Rules

Difficulty is bounded `1-10`.

```text
no attempts -> stable/no_evidence
2+ consecutive incorrect or weighted recent accuracy <= 35% -> -1
mastery < 35 and weighted recent accuracy < 60% -> -1
3+ consecutive correct -> +1
4+ recent attempts and weighted recent accuracy >= 85% -> +1
mastery >= 85 and weighted recent accuracy >= 75% -> +1
otherwise -> stable
```

Boundary clamps return `lower_boundary` or `upper_boundary` when a change would exceed the scale.

## Misconception Lifecycle

The engine receives misconception identifiers from elsewhere and never invents labels.

```text
2+ recent incorrect attempts with the same misconception -> recurring
previous occurrence count >= 2 and another matching incorrect attempt -> recurring
3+ recent correct attempts without the misconception and 0 matching incorrect -> resolved
2+ recent correct attempts without the misconception from active/recurring -> improving
1 matching incorrect attempt -> active
otherwise preserve current status or active
```

## Intervention Rules

```text
no recent evidence -> continue
recurring misconception -> review-prerequisite
active misconception -> worked-example
2+ consecutive incorrect -> retry
1 consecutive incorrect -> hint
weighted recent accuracy <= 40% -> simplify
mastery < 40 and weighted recent accuracy < 70% -> reinforce
3+ consecutive correct -> increase-challenge
mastery >= 80 and weighted recent accuracy >= 80% -> increase-challenge
otherwise -> continue
```

Returned reasons are machine-readable codes only. No hidden reasoning or user-facing prose is produced here.
