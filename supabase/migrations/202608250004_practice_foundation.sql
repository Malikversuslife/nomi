-- Milestone 4: deterministic seeded practice-question foundation and atomic persistence boundary.
-- Adaptive calculations stay in TypeScript. This SQL only stores trusted, already-calculated results atomically.

create table public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  slug text not null,
  concept_name text not null,
  difficulty integer not null,
  question_type text not null,
  prompt text not null,
  options jsonb,
  expected_answer jsonb not null,
  explanation text not null,
  misconception_key text,
  misconception_category text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_questions_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint practice_questions_difficulty_range check (difficulty between 1 and 10),
  constraint practice_questions_type_check check (question_type in ('multiple_choice', 'short_answer')),
  constraint practice_questions_options_for_mc check (question_type <> 'multiple_choice' or jsonb_typeof(options) = 'array'),
  constraint practice_questions_misconception_category_check check (misconception_category is null or misconception_category in ('conceptual_understanding', 'calculation_error', 'terminology_confusion', 'skipped_step', 'careless_mistake', 'missing_prerequisite', 'unknown')),
  unique (topic_id, slug)
);

comment on table public.practice_questions is 'Small deterministic V1 question bank. Canonical topic_id is authoritative; no AI-generated questions in Milestone 4.';

create index practice_questions_topic_difficulty_idx on public.practice_questions (topic_id, difficulty, sort_order) where active = true;

alter table public.practice_questions enable row level security;

create policy "authenticated learners can read active practice questions"
on public.practice_questions
for select
to authenticated
using (active = true);

create trigger practice_questions_set_updated_at
before update on public.practice_questions
for each row execute function public.set_updated_at();

alter table public.practice_attempts
add column submission_key text;

comment on column public.practice_attempts.submission_key is 'Server-validated idempotency key. Unique per user when present to prevent duplicate learner evidence from retries.';

create unique index practice_attempts_user_submission_key_idx
on public.practice_attempts (user_id, submission_key)
where submission_key is not null;

create or replace function public.persist_practice_result(
  p_submission_key text,
  p_learner_subject_id uuid,
  p_topic_progress_id uuid,
  p_topic_id uuid,
  p_concept_name text,
  p_difficulty integer,
  p_question_snapshot jsonb,
  p_expected_answer jsonb,
  p_learner_answer jsonb,
  p_is_correct boolean,
  p_response_time_ms integer,
  p_misconception_key text,
  p_misconception_category text,
  p_misconception_status text,
  p_misconception_occurrence_count integer,
  p_misconception_evidence_summary text,
  p_subject_name_snapshot text,
  p_topic_name_snapshot text,
  p_learning_session_id uuid,
  p_mastery numeric,
  p_recent_accuracy numeric,
  p_next_difficulty integer,
  p_attempted_count integer,
  p_correct_count integer,
  p_consecutive_correct integer,
  p_consecutive_incorrect integer,
  p_recommended_intervention text
)
returns table (attempt_id uuid, inserted boolean)
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_existing_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_submission_key is null or length(btrim(p_submission_key)) < 8 then
    raise exception 'A valid submission key is required';
  end if;

  if p_learning_session_id is not null and not exists (
    select 1 from public.learning_sessions s where s.id = p_learning_session_id and s.user_id = v_user_id
  ) then
    raise exception 'learning_session_id does not belong to the authenticated user';
  end if;

  if not exists (
    select 1 from public.learner_subjects ls where ls.id = p_learner_subject_id and ls.user_id = v_user_id
  ) then
    raise exception 'learner_subject_id does not belong to the authenticated user';
  end if;

  if not exists (
    select 1 from public.topic_progress tp where tp.id = p_topic_progress_id and tp.user_id = v_user_id and tp.topic_id = p_topic_id
  ) then
    raise exception 'topic_progress_id does not belong to the authenticated user/topic';
  end if;

  select pa.id into v_existing_attempt_id
  from public.practice_attempts pa
  where pa.user_id = v_user_id and pa.submission_key = p_submission_key;

  if v_existing_attempt_id is not null then
    attempt_id := v_existing_attempt_id;
    inserted := false;
    return next;
    return;
  end if;

  insert into public.practice_attempts (
    user_id,
    topic_progress_id,
    topic_id,
    concept_name,
    difficulty,
    question_snapshot,
    expected_answer,
    learner_answer,
    is_correct,
    response_time_ms,
    misconception_category,
    subject_name_snapshot,
    topic_name_snapshot,
    learning_session_id,
    submission_key
  ) values (
    v_user_id,
    p_topic_progress_id,
    p_topic_id,
    p_concept_name,
    p_difficulty,
    p_question_snapshot,
    p_expected_answer,
    p_learner_answer,
    p_is_correct,
    p_response_time_ms,
    p_misconception_category,
    p_subject_name_snapshot,
    p_topic_name_snapshot,
    p_learning_session_id,
    p_submission_key
  )
  returning id into v_attempt_id;

  update public.topic_progress
  set
    mastery = p_mastery,
    recent_accuracy = p_recent_accuracy,
    difficulty = p_next_difficulty,
    attempted_count = p_attempted_count,
    correct_count = p_correct_count,
    consecutive_correct = p_consecutive_correct,
    consecutive_incorrect = p_consecutive_incorrect,
    recommended_intervention = p_recommended_intervention,
    last_practiced_at = now()
  where id = p_topic_progress_id and user_id = v_user_id;

  if not found then
    raise exception 'topic_progress update failed';
  end if;

  if p_misconception_key is not null and p_misconception_category is not null and p_misconception_status is not null then
    insert into public.misconception_state (
      user_id,
      topic_progress_id,
      topic_id,
      concept_name,
      category,
      status,
      occurrence_count,
      first_seen_at,
      last_seen_at,
      resolved_at,
      evidence_summary
    ) values (
      v_user_id,
      p_topic_progress_id,
      p_topic_id,
      p_misconception_key,
      p_misconception_category,
      p_misconception_status,
      p_misconception_occurrence_count,
      now(),
      now(),
      case when p_misconception_status = 'resolved' then now() else null end,
      p_misconception_evidence_summary
    )
    on conflict (user_id, topic_id, concept_name, category) do update
    set
      topic_progress_id = excluded.topic_progress_id,
      status = excluded.status,
      occurrence_count = excluded.occurrence_count,
      last_seen_at = now(),
      resolved_at = case when excluded.status = 'resolved' then now() else null end,
      evidence_summary = excluded.evidence_summary;
  end if;

  attempt_id := v_attempt_id;
  inserted := true;
  return next;
end;
$$;

grant execute on function public.persist_practice_result(
  text, uuid, uuid, uuid, text, integer, jsonb, jsonb, jsonb, boolean, integer, text, text, text, integer, text, text, text, uuid, numeric, numeric, integer, integer, integer, integer, integer, text
) to authenticated;

with topic_target as (
  select t.id as topic_id
  from public.topics t
  join public.topics parent on parent.id = t.parent_topic_id
  join public.topics root on root.id = parent.parent_topic_id
  join public.subjects s on s.id = t.subject_id
  where s.slug = 'mathematics'
    and root.slug = 'algebra'
    and parent.slug = 'quadratic-equations'
    and t.slug = 'factorisation'
  limit 1
)
insert into public.practice_questions (
  topic_id,
  slug,
  concept_name,
  difficulty,
  question_type,
  prompt,
  options,
  expected_answer,
  explanation,
  misconception_key,
  misconception_category,
  sort_order
)
values
  ((select topic_id from topic_target), 'factorise-x2-plus-5x-plus-6', 'Factorisation', 2, 'multiple_choice', 'Factorise x^2 + 5x + 6.', '[{"id":"a","label":"(x + 2)(x + 3)"},{"id":"b","label":"(x + 1)(x + 6)"},{"id":"c","label":"(x - 2)(x - 3)"}]'::jsonb, '{"option_id":"a","accepted":["(x+2)(x+3)","(x + 2)(x + 3)"]}'::jsonb, 'Look for two numbers that multiply to 6 and add to 5: 2 and 3.', 'factor-pair-selection', 'conceptual_understanding', 10),
  ((select topic_id from topic_target), 'factorise-x2-plus-7x-plus-10', 'Factorisation', 3, 'multiple_choice', 'Factorise x^2 + 7x + 10.', '[{"id":"a","label":"(x + 1)(x + 10)"},{"id":"b","label":"(x + 2)(x + 5)"},{"id":"c","label":"(x - 2)(x - 5)"}]'::jsonb, '{"option_id":"b","accepted":["(x+2)(x+5)","(x + 2)(x + 5)"]}'::jsonb, 'The pair 2 and 5 multiplies to 10 and adds to 7.', 'factor-pair-selection', 'conceptual_understanding', 20),
  ((select topic_id from topic_target), 'factorise-x2-minus-5x-plus-6', 'Factorisation', 4, 'multiple_choice', 'Factorise x^2 - 5x + 6.', '[{"id":"a","label":"(x - 2)(x - 3)"},{"id":"b","label":"(x + 2)(x + 3)"},{"id":"c","label":"(x - 1)(x - 6)"}]'::jsonb, '{"option_id":"a","accepted":["(x-2)(x-3)","(x - 2)(x - 3)"]}'::jsonb, 'The pair -2 and -3 multiplies to 6 and adds to -5.', 'sign-error-factorisation', 'calculation_error', 30),
  ((select topic_id from topic_target), 'factorise-x2-minus-x-minus-6', 'Factorisation', 5, 'short_answer', 'Factorise x^2 - x - 6.', null, '{"accepted":["(x-3)(x+2)","(x + 2)(x - 3)","(x-3)(x + 2)","(x + 2)(x-3)"]}'::jsonb, 'The pair -3 and 2 multiplies to -6 and adds to -1.', 'sign-error-factorisation', 'calculation_error', 40),
  ((select topic_id from topic_target), 'factorise-2x2-plus-7x-plus-3', 'Factorisation', 6, 'multiple_choice', 'Factorise 2x^2 + 7x + 3.', '[{"id":"a","label":"(2x + 1)(x + 3)"},{"id":"b","label":"(2x + 3)(x + 1)"},{"id":"c","label":"(x + 1)(x + 3)"}]'::jsonb, '{"option_id":"a","accepted":["(2x+1)(x+3)","(2x + 1)(x + 3)"]}'::jsonb, 'Expanding (2x + 1)(x + 3) gives 2x^2 + 7x + 3.', 'coefficient-factorisation', 'conceptual_understanding', 50)
on conflict (topic_id, slug) do update set
  concept_name = excluded.concept_name,
  difficulty = excluded.difficulty,
  question_type = excluded.question_type,
  prompt = excluded.prompt,
  options = excluded.options,
  expected_answer = excluded.expected_answer,
  explanation = excluded.explanation,
  misconception_key = excluded.misconception_key,
  misconception_category = excluded.misconception_category,
  active = true,
  sort_order = excluded.sort_order;
