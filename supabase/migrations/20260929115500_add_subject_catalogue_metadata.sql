alter table public.subjects
  add column if not exists field text not null default 'Other',
  add column if not exists search_terms text[] not null default '{}',
  add column if not exists availability text not null default 'available',
  add column if not exists artwork_kind text not null default 'icon';

alter table public.subjects
  drop constraint if exists subjects_availability_check,
  add constraint subjects_availability_check
    check (availability in ('available', 'coming_soon')),
  drop constraint if exists subjects_artwork_kind_check,
  add constraint subjects_artwork_kind_check
    check (artwork_kind in ('3d', 'icon'));

update public.subjects set
  field = case slug
    when 'mathematics' then 'Mathematics'
    when 'physics' then 'Sciences'
    when 'chemistry' then 'Sciences'
    when 'biology' then 'Sciences'
    else field
  end,
  search_terms = case slug
    when 'mathematics' then array['maths', 'math', 'numbers', 'algebra']
    when 'physics' then array['science', 'mechanics', 'energy']
    when 'chemistry' then array['science', 'elements', 'reactions']
    when 'biology' then array['science', 'life science', 'living things']
    else search_terms
  end,
  availability = 'available',
  artwork_kind = case when slug in ('mathematics', 'physics', 'chemistry', 'biology') then '3d' else artwork_kind end;

insert into public.subjects
  (slug, name, description, icon_key, field, search_terms, availability, artwork_kind, sort_order, active)
values
  ('computer-science', 'Computer Science', 'Computing, programming and digital problem solving.', 'computer', 'Computing', array['computing', 'coding', 'programming', 'ict'], 'coming_soon', 'icon', 50, true),
  ('statistics', 'Statistics', 'Data, probability and evidence-based reasoning.', 'chart', 'Mathematics', array['data', 'probability', 'graphs'], 'coming_soon', 'icon', 60, true),
  ('english-language', 'English Language', 'Reading, writing, grammar and communication.', 'language', 'Languages', array['english', 'literacy', 'writing', 'grammar'], 'coming_soon', 'icon', 70, true),
  ('economics', 'Economics', 'Markets, choices, resources and society.', 'economics', 'Social Sciences', array['markets', 'finance', 'social science'], 'coming_soon', 'icon', 80, true),
  ('geography', 'Geography', 'People, places, environments and our changing planet.', 'globe', 'Humanities', array['earth', 'maps', 'environment'], 'coming_soon', 'icon', 90, true),
  ('history', 'History', 'People, events and ideas that shaped the world.', 'history', 'Humanities', array['past', 'civilisation', 'events'], 'coming_soon', 'icon', 100, true),
  ('business-studies', 'Business Studies', 'Enterprise, organisations, finance and strategy.', 'business', 'Business', array['enterprise', 'commerce', 'management'], 'coming_soon', 'icon', 110, true),
  ('creative-arts', 'Creative Arts', 'Art, visual communication and creative practice.', 'art', 'Creative Arts', array['art', 'design', 'drawing', 'visual arts'], 'coming_soon', 'icon', 120, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  field = excluded.field,
  search_terms = excluded.search_terms,
  availability = excluded.availability,
  artwork_kind = excluded.artwork_kind,
  sort_order = excluded.sort_order,
  active = excluded.active;

create index if not exists subjects_field_sort_idx on public.subjects (field, sort_order)
  where active = true;

comment on column public.subjects.availability is
  'available subjects have complete learning content; coming_soon subjects are discoverable but cannot be enrolled yet.';
