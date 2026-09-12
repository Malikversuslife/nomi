-- Persist first-time onboarding without conflating declared goals with adaptive evidence.
alter table public.profiles
  add column if not exists learning_goal text,
  add column if not exists onboarding_completed_at timestamptz;

create index if not exists profiles_onboarding_completed_idx
  on public.profiles (onboarding_completed_at);

-- Authenticated learners may update only their own profile. Existing RLS remains authoritative.
-- Subject choices use the existing learner_subjects relation so Add Subject and onboarding share one model.
create or replace function public.complete_learner_onboarding(
  p_learning_goal text,
  p_grade_year text,
  p_subject_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(btrim(p_learning_goal), '') is null then
    raise exception 'Learning goal is required';
  end if;

  if coalesce(array_length(p_subject_ids, 1), 0) = 0 then
    raise exception 'At least one subject is required';
  end if;

  update public.profiles
  set learning_goal = btrim(p_learning_goal),
      grade_year = nullif(btrim(p_grade_year), ''),
      onboarding_completed_at = now(),
      updated_at = now()
  where id = v_user_id;

  foreach v_subject_id in array p_subject_ids loop
    insert into public.learner_subjects (user_id, subject_id, status)
    select v_user_id, s.id, 'active'
    from public.subjects s
    where s.id = v_subject_id and s.active = true
    on conflict (user_id, subject_id)
    do update set status = 'active', updated_at = now();
  end loop;
end;
$$;

grant execute on function public.complete_learner_onboarding(text, text, uuid[]) to authenticated;