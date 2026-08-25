-- Align topic_progress.recommended_intervention with the approved Milestone 3 deterministic intervention vocabulary.
-- This is forward-only and preserves nullable recommended_intervention values.

alter table public.topic_progress
drop constraint if exists topic_progress_intervention_check;

alter table public.topic_progress
add constraint topic_progress_intervention_check
check (
  recommended_intervention is null
  or recommended_intervention in (
    'continue',
    'reinforce',
    'simplify',
    'worked-example',
    'hint',
    'retry',
    'increase-challenge',
    'review-prerequisite'
  )
);
