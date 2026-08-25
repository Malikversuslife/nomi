-- Nomi Milestone 2 foundation schema.
-- Authoritative curriculum identity uses subjects.id and topics.id. Human-readable labels in learner evidence are snapshots only.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_key text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  parent_topic_id uuid,
  slug text not null,
  name text not null,
  description text,
  depth integer not null default 0,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint topics_depth_nonnegative check (depth >= 0),
  constraint topics_not_own_parent check (parent_topic_id is null or parent_topic_id <> id),
  unique (id, subject_id),
  foreign key (parent_topic_id, subject_id) references public.topics(id, subject_id) on delete cascade
);

create unique index topics_unique_root_slug_per_subject on public.topics (subject_id, slug) where parent_topic_id is null;
create unique index topics_unique_child_slug_per_parent on public.topics (subject_id, parent_topic_id, slug) where parent_topic_id is not null;
create index topics_subject_parent_sort_idx on public.topics (subject_id, parent_topic_id, sort_order);
create index topics_active_idx on public.topics (active);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  grade_year text,
  daily_goal_minutes integer not null default 20,
  preferred_explanation_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (length(btrim(display_name)) > 0),
  constraint profiles_daily_goal_positive check (daily_goal_minutes between 1 and 240)
);

create table public.learner_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_subjects_status_check check (status in ('active', 'paused', 'archived')),
  unique (user_id, subject_id),
  unique (id, user_id),
  unique (id, subject_id)
);

create index learner_subjects_user_idx on public.learner_subjects (user_id);
create index learner_subjects_subject_idx on public.learner_subjects (subject_id);

create table public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learner_subject_id uuid not null,
  topic_id uuid not null,
  mastery numeric(5,2) not null default 0,
  recent_accuracy numeric(5,2) not null default 0,
  difficulty integer not null default 1,
  attempted_count integer not null default 0,
  correct_count integer not null default 0,
  consecutive_correct integer not null default 0,
  consecutive_incorrect integer not null default 0,
  confidence numeric(5,2),
  preferred_explanation_style text,
  recommended_intervention text,
  last_practiced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topic_progress_mastery_range check (mastery between 0 and 100),
  constraint topic_progress_recent_accuracy_range check (recent_accuracy between 0 and 100),
  constraint topic_progress_difficulty_range check (difficulty between 1 and 10),
  constraint topic_progress_counts_nonnegative check (attempted_count >= 0 and correct_count >= 0 and consecutive_correct >= 0 and consecutive_incorrect >= 0),
  constraint topic_progress_correct_not_more_than_attempted check (correct_count <= attempted_count),
  constraint topic_progress_confidence_range check (confidence is null or confidence between 0 and 100),
  constraint topic_progress_intervention_check check (recommended_intervention is null or recommended_intervention in ('reinforce', 'guided_practice', 'remediation', 'standard_practice', 'challenge', 'review')),
  unique (user_id, topic_id),
  unique (id, user_id),
  unique (id, topic_id),
  foreign key (learner_subject_id, user_id) references public.learner_subjects(id, user_id) on delete cascade,
  foreign key (topic_id) references public.topics(id) on delete restrict
);

create index topic_progress_user_idx on public.topic_progress (user_id);
create index topic_progress_learner_subject_idx on public.topic_progress (learner_subject_id);
create index topic_progress_topic_idx on public.topic_progress (topic_id);
create index topic_progress_intervention_idx on public.topic_progress (user_id, recommended_intervention);

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'study',
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  summary text,
  created_at timestamptz not null default now(),
  constraint learning_sessions_mode_check check (mode in ('study', 'practice', 'tutor', 'review')),
  constraint learning_sessions_time_order check (ended_at is null or ended_at >= started_at),
  unique (id, user_id)
);

create index learning_sessions_user_started_idx on public.learning_sessions (user_id, started_at desc);
create index learning_sessions_subject_topic_idx on public.learning_sessions (subject_id, topic_id);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_progress_id uuid not null,
  topic_id uuid not null,
  concept_name text,
  difficulty integer not null,
  question_snapshot jsonb not null,
  expected_answer jsonb,
  learner_answer jsonb,
  is_correct boolean,
  response_time_ms integer,
  misconception_category text,
  subject_name_snapshot text,
  topic_name_snapshot text,
  learning_session_id uuid,
  created_at timestamptz not null default now(),
  constraint practice_attempts_difficulty_range check (difficulty between 1 and 10),
  constraint practice_attempts_response_time_nonnegative check (response_time_ms is null or response_time_ms >= 0),
  constraint practice_attempts_misconception_category_check check (misconception_category is null or misconception_category in ('conceptual_understanding', 'calculation_error', 'terminology_confusion', 'skipped_step', 'careless_mistake', 'missing_prerequisite', 'unknown')),
  foreign key (topic_progress_id, user_id) references public.topic_progress(id, user_id) on delete cascade,
  foreign key (topic_progress_id, topic_id) references public.topic_progress(id, topic_id) on delete cascade,
  foreign key (topic_id) references public.topics(id) on delete restrict,
  foreign key (learning_session_id) references public.learning_sessions(id) on delete set null
);

comment on column public.practice_attempts.subject_name_snapshot is 'Historical display label only. Canonical subject identity comes through topic_id/topic_progress_id relationships, not this snapshot.';
comment on column public.practice_attempts.topic_name_snapshot is 'Historical display label only. Canonical topic identity comes through topic_id/topic_progress_id relationships, not this snapshot.';

create index practice_attempts_user_created_idx on public.practice_attempts (user_id, created_at desc);
create index practice_attempts_progress_created_idx on public.practice_attempts (topic_progress_id, created_at desc);
create index practice_attempts_topic_created_idx on public.practice_attempts (topic_id, created_at desc);
create index practice_attempts_session_idx on public.practice_attempts (learning_session_id) where learning_session_id is not null;

create table public.misconception_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_progress_id uuid not null,
  topic_id uuid not null,
  concept_name text not null,
  category text not null,
  status text not null default 'active',
  occurrence_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  evidence_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint misconception_concept_not_blank check (length(btrim(concept_name)) > 0),
  constraint misconception_category_check check (category in ('conceptual_understanding', 'calculation_error', 'terminology_confusion', 'skipped_step', 'careless_mistake', 'missing_prerequisite', 'unknown')),
  constraint misconception_status_check check (status in ('active', 'recurring', 'improving', 'resolved')),
  constraint misconception_occurrence_positive check (occurrence_count >= 1),
  constraint misconception_seen_order check (last_seen_at >= first_seen_at),
  constraint misconception_resolved_order check (resolved_at is null or resolved_at >= first_seen_at),
  unique (user_id, topic_id, concept_name, category),
  foreign key (topic_progress_id, user_id) references public.topic_progress(id, user_id) on delete cascade,
  foreign key (topic_progress_id, topic_id) references public.topic_progress(id, topic_id) on delete cascade,
  foreign key (topic_id) references public.topics(id) on delete restrict
);

create index misconception_state_user_topic_status_idx on public.misconception_state (user_id, topic_id, status);
create index misconception_state_progress_status_idx on public.misconception_state (topic_progress_id, status);

create table public.tutor_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_session_id uuid,
  topic_progress_id uuid,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (learning_session_id) references public.learning_sessions(id) on delete set null,
  foreign key (topic_progress_id) references public.topic_progress(id) on delete set null,
  unique (id, user_id)
);

create index tutor_threads_user_updated_idx on public.tutor_threads (user_id, updated_at desc);
create index tutor_threads_session_idx on public.tutor_threads (learning_session_id) where learning_session_id is not null;
create index tutor_threads_progress_idx on public.tutor_threads (topic_progress_id) where topic_progress_id is not null;

create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid not null,
  role text not null,
  content text not null,
  message_kind text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint tutor_messages_role_check check (role in ('user', 'assistant', 'system')),
  constraint tutor_messages_content_not_blank check (length(btrim(content)) > 0),
  constraint tutor_messages_no_chain_of_thought_key check (not (metadata ? 'chain_of_thought') and not (metadata ? 'hidden_reasoning')),
  foreign key (thread_id, user_id) references public.tutor_threads(id, user_id) on delete cascade
);

comment on table public.tutor_messages is 'Stores visible tutor conversation messages only. Hidden chain-of-thought must never be persisted.';

create index tutor_messages_thread_created_idx on public.tutor_messages (thread_id, created_at);
create index tutor_messages_user_created_idx on public.tutor_messages (user_id, created_at desc);

create trigger subjects_set_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger topics_set_updated_at before update on public.topics for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger learner_subjects_set_updated_at before update on public.learner_subjects for each row execute function public.set_updated_at();
create trigger topic_progress_set_updated_at before update on public.topic_progress for each row execute function public.set_updated_at();
create trigger misconception_state_set_updated_at before update on public.misconception_state for each row execute function public.set_updated_at();
create trigger tutor_threads_set_updated_at before update on public.tutor_threads for each row execute function public.set_updated_at();

alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.profiles enable row level security;
alter table public.learner_subjects enable row level security;
alter table public.topic_progress enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.misconception_state enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.tutor_threads enable row level security;
alter table public.tutor_messages enable row level security;

create policy "authenticated learners can read active subjects" on public.subjects for select to authenticated using (active = true);
create policy "authenticated learners can read active topics" on public.topics for select to authenticated using (active = true);

create policy "learners can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "learners can insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "learners can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "learners can read own learner subjects" on public.learner_subjects for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own learner subjects" on public.learner_subjects for insert to authenticated with check (user_id = auth.uid());
create policy "learners can update own learner subjects" on public.learner_subjects for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "learners can read own topic progress" on public.topic_progress for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own topic progress" on public.topic_progress for insert to authenticated with check (user_id = auth.uid());
create policy "learners can update own topic progress" on public.topic_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "learners can read own practice attempts" on public.practice_attempts for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own practice attempts" on public.practice_attempts for insert to authenticated with check (user_id = auth.uid());

create policy "learners can read own misconception state" on public.misconception_state for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own misconception state" on public.misconception_state for insert to authenticated with check (user_id = auth.uid());
create policy "learners can update own misconception state" on public.misconception_state for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "learners can read own learning sessions" on public.learning_sessions for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own learning sessions" on public.learning_sessions for insert to authenticated with check (user_id = auth.uid());
create policy "learners can update own learning sessions" on public.learning_sessions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "learners can read own tutor threads" on public.tutor_threads for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own tutor threads" on public.tutor_threads for insert to authenticated with check (user_id = auth.uid());
create policy "learners can update own tutor threads" on public.tutor_threads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "learners can read own tutor messages" on public.tutor_messages for select to authenticated using (user_id = auth.uid());
create policy "learners can insert own tutor messages" on public.tutor_messages for insert to authenticated with check (user_id = auth.uid());
