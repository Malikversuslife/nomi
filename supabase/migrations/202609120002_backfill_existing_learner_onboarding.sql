-- Existing learners with established subject membership or assessed progress predate
-- the first-time onboarding flow. Mark them complete so only genuinely new accounts
-- are routed through onboarding.
update public.profiles p
set onboarding_completed_at = coalesce(p.onboarding_completed_at, now()),
    updated_at = now()
where p.onboarding_completed_at is null
  and (
    exists (select 1 from public.learner_subjects ls where ls.user_id = p.id)
    or exists (select 1 from public.topic_progress tp where tp.user_id = p.id)
  );