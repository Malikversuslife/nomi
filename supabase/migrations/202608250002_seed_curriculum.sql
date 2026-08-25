-- Small canonical curriculum seed for Nomi V1 demos. This is not a CMS.

insert into public.subjects (slug, name, description, icon_key, sort_order, active)
values
  ('mathematics', 'Mathematics', 'Patterns, numbers, algebra, and problem solving.', 'calculator', 10, true),
  ('physics', 'Physics', 'Forces, motion, energy, and how the physical world works.', 'atom', 20, true),
  ('chemistry', 'Chemistry', 'Matter, reactions, and the substances around us.', 'flask', 30, true),
  ('biology', 'Biology', 'Cells, organisms, and living systems.', 'leaf', 40, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  active = excluded.active;

with subject_rows as (
  select id, slug from public.subjects where slug in ('mathematics', 'physics', 'chemistry', 'biology')
), root_topics as (
  insert into public.topics (subject_id, parent_topic_id, slug, name, description, depth, sort_order, active)
  values
    ((select id from subject_rows where slug = 'mathematics'), null, 'algebra', 'Algebra', 'Using symbols and structure to solve problems.', 0, 10, true),
    ((select id from subject_rows where slug = 'physics'), null, 'motion', 'Motion', 'Describing how objects move.', 0, 10, true),
    ((select id from subject_rows where slug = 'chemistry'), null, 'chemical-reactions', 'Chemical reactions', 'Understanding how substances change.', 0, 10, true),
    ((select id from subject_rows where slug = 'biology'), null, 'cell-biology', 'Cell biology', 'The structure and function of cells.', 0, 10, true)
  on conflict do nothing
  returning id, subject_id, slug
), all_roots as (
  select id, subject_id, slug from root_topics
  union
  select t.id, t.subject_id, t.slug
  from public.topics t
  join subject_rows s on s.id = t.subject_id
  where t.parent_topic_id is null and t.slug in ('algebra', 'motion', 'chemical-reactions', 'cell-biology')
), middle_topics as (
  insert into public.topics (subject_id, parent_topic_id, slug, name, description, depth, sort_order, active)
  values
    ((select subject_id from all_roots where slug = 'algebra'), (select id from all_roots where slug = 'algebra'), 'quadratic-equations', 'Quadratic equations', 'Solving equations with squared terms.', 1, 10, true)
  on conflict do nothing
  returning id, subject_id, slug
), all_middle as (
  select id, subject_id, slug from middle_topics
  union
  select t.id, t.subject_id, t.slug
  from public.topics t
  join all_roots r on r.id = t.parent_topic_id
  where t.slug = 'quadratic-equations'
)
insert into public.topics (subject_id, parent_topic_id, slug, name, description, depth, sort_order, active)
values
  ((select subject_id from all_middle where slug = 'quadratic-equations'), (select id from all_middle where slug = 'quadratic-equations'), 'factorisation', 'Factorisation', 'Rewriting quadratics as multiplied brackets.', 2, 10, true),
  ((select subject_id from all_middle where slug = 'quadratic-equations'), (select id from all_middle where slug = 'quadratic-equations'), 'completing-the-square', 'Completing the square', 'Rewriting a quadratic to reveal its turning point.', 2, 20, true),
  ((select subject_id from all_middle where slug = 'quadratic-equations'), (select id from all_middle where slug = 'quadratic-equations'), 'quadratic-formula', 'Quadratic formula', 'Using the formula to solve quadratic equations.', 2, 30, true),
  ((select subject_id from all_roots where slug = 'motion'), (select id from all_roots where slug = 'motion'), 'speed-and-velocity', 'Speed and velocity', 'Comparing scalar speed and directional velocity.', 1, 10, true),
  ((select subject_id from all_roots where slug = 'motion'), (select id from all_roots where slug = 'motion'), 'acceleration', 'Acceleration', 'Understanding changes in velocity over time.', 1, 20, true),
  ((select subject_id from all_roots where slug = 'motion'), (select id from all_roots where slug = 'motion'), 'motion-graphs', 'Motion graphs', 'Interpreting distance-time and velocity-time graphs.', 1, 30, true),
  ((select subject_id from all_roots where slug = 'chemical-reactions'), (select id from all_roots where slug = 'chemical-reactions'), 'balancing-equations', 'Balancing equations', 'Keeping atoms conserved in reaction equations.', 1, 10, true),
  ((select subject_id from all_roots where slug = 'chemical-reactions'), (select id from all_roots where slug = 'chemical-reactions'), 'reaction-types', 'Reaction types', 'Recognising common patterns in chemical reactions.', 1, 20, true),
  ((select subject_id from all_roots where slug = 'cell-biology'), (select id from all_roots where slug = 'cell-biology'), 'cell-structure', 'Cell structure', 'Identifying parts of cells and their roles.', 1, 10, true),
  ((select subject_id from all_roots where slug = 'cell-biology'), (select id from all_roots where slug = 'cell-biology'), 'photosynthesis', 'Photosynthesis', 'How plants use light to make glucose.', 1, 20, true),
  ((select subject_id from all_roots where slug = 'cell-biology'), (select id from all_roots where slug = 'cell-biology'), 'cellular-respiration', 'Cellular respiration', 'How cells release energy from glucose.', 1, 30, true)
on conflict do nothing;
