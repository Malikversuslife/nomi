-- Expand the canonical Quadratic Equations assessment floor beyond Factorisation.
-- Nomi may generate/adapt teaching around these concepts, but these questions remain deterministic evidence.

with topic_targets as (
  select t.id as topic_id, t.slug as topic_slug
  from public.topics t
  join public.topics parent on parent.id = t.parent_topic_id
  join public.topics root on root.id = parent.parent_topic_id
  join public.subjects s on s.id = t.subject_id
  where s.slug = 'mathematics'
    and root.slug = 'algebra'
    and parent.slug = 'quadratic-equations'
    and t.slug in ('completing-the-square', 'quadratic-formula')
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
  ((select topic_id from topic_targets where topic_slug = 'completing-the-square'), 'cts-01', 'Completing the square', 3, 'multiple_choice', 'Complete the square: x^2 + 6x + 5 = (x + 3)^2 + ___.', '[{"id":"a","label":"-4"},{"id":"b","label":"4"},{"id":"c","label":"-9"}]'::jsonb, '{"option_id":"a","accepted":["-4"]}'::jsonb, 'Since (x + 3)^2 = x^2 + 6x + 9, subtract 4 to return to x^2 + 6x + 5.', 'square-adjustment', 'calculation_error', 10),
  ((select topic_id from topic_targets where topic_slug = 'completing-the-square'), 'cts-02', 'Completing the square', 4, 'short_answer', 'Write x^2 + 8x + 7 in the form (x + a)^2 + b.', null, '{"accepted":["(x+4)^2-9","(x + 4)^2 - 9","(x+4)^2 - 9","(x + 4)^2-9"]}'::jsonb, 'Half of 8 is 4. Adding 16 inside the square means subtracting 16 outside, so 7 - 16 = -9.', 'half-linear-coefficient', 'conceptual_understanding', 20),
  ((select topic_id from topic_targets where topic_slug = 'completing-the-square'), 'cts-03', 'Completing the square', 5, 'multiple_choice', 'Which expression is equivalent to x^2 - 10x + 21?', '[{"id":"a","label":"(x - 5)^2 - 4"},{"id":"b","label":"(x - 5)^2 + 4"},{"id":"c","label":"(x + 5)^2 - 4"}]'::jsonb, '{"option_id":"a","accepted":["(x-5)^2-4","(x - 5)^2 - 4"]}'::jsonb, 'Completing the square gives x^2 - 10x + 25 - 4 = (x - 5)^2 - 4.', 'sign-square-completion', 'calculation_error', 30),
  ((select topic_id from topic_targets where topic_slug = 'completing-the-square'), 'cts-04', 'Completing the square', 6, 'short_answer', 'Solve x^2 + 4x - 5 = 0 by completing the square. Give both roots.', null, '{"accepted":["1,-5","1, -5","-5,1","-5, 1","x=1,x=-5","x = 1, x = -5","x=-5,x=1","x = -5, x = 1"]}'::jsonb, 'Rewrite as (x + 2)^2 = 9, then use both square roots: x + 2 = ±3, giving x = 1 or x = -5.', 'square-root-plus-minus', 'skipped_step', 40),
  ((select topic_id from topic_targets where topic_slug = 'completing-the-square'), 'cts-05', 'Completing the square', 7, 'multiple_choice', 'Complete the square: x^2 + 3x + 1 = (x + 3/2)^2 + ___.', '[{"id":"a","label":"-5/4"},{"id":"b","label":"5/4"},{"id":"c","label":"-9/4"}]'::jsonb, '{"option_id":"a","accepted":["-5/4"]}'::jsonb, 'The square contributes 9/4, while 1 is 4/4, so the adjustment is 4/4 - 9/4 = -5/4.', 'fractional-square-adjustment', 'calculation_error', 50),

  ((select topic_id from topic_targets where topic_slug = 'quadratic-formula'), 'qf-01', 'Quadratic formula', 3, 'multiple_choice', 'For x^2 + 5x + 6 = 0, what are a, b and c?', '[{"id":"a","label":"a = 1, b = 5, c = 6"},{"id":"b","label":"a = 0, b = 5, c = 6"},{"id":"c","label":"a = 1, b = -5, c = 6"}]'::jsonb, '{"option_id":"a","accepted":["a = 1, b = 5, c = 6","a=1,b=5,c=6"]}'::jsonb, 'Match ax^2 + bx + c = 0 term by term: a = 1, b = 5 and c = 6.', 'coefficient-identification', 'conceptual_understanding', 10),
  ((select topic_id from topic_targets where topic_slug = 'quadratic-formula'), 'qf-02', 'Quadratic formula', 4, 'short_answer', 'Use the quadratic formula to solve x^2 - 5x + 6 = 0. Give both roots.', null, '{"accepted":["2,3","2, 3","3,2","3, 2","x=2,x=3","x = 2, x = 3","x=3,x=2","x = 3, x = 2"]}'::jsonb, 'Substitute a = 1, b = -5 and c = 6. The discriminant is 1, so x = (5 ± 1) / 2, giving 2 and 3.', 'formula-substitution', 'skipped_step', 20),
  ((select topic_id from topic_targets where topic_slug = 'quadratic-formula'), 'qf-03', 'Quadratic formula', 5, 'multiple_choice', 'What is the discriminant of 2x^2 + 3x - 2 = 0?', '[{"id":"a","label":"25"},{"id":"b","label":"-7"},{"id":"c","label":"17"}]'::jsonb, '{"option_id":"a","accepted":["25"]}'::jsonb, 'b^2 - 4ac = 3^2 - 4(2)(-2) = 9 + 16 = 25.', 'discriminant-sign', 'calculation_error', 30),
  ((select topic_id from topic_targets where topic_slug = 'quadratic-formula'), 'qf-04', 'Quadratic formula', 6, 'short_answer', 'Use the quadratic formula to solve 2x^2 + 7x + 3 = 0. Give both roots.', null, '{"accepted":["-1/2,-3","-1/2, -3","-3,-1/2","-3, -1/2","x=-1/2,x=-3","x = -1/2, x = -3","x=-3,x=-1/2","x = -3, x = -1/2"]}'::jsonb, 'The discriminant is 25. x = (-7 ± 5) / 4, which gives -1/2 and -3.', 'denominator-formula', 'calculation_error', 40),
  ((select topic_id from topic_targets where topic_slug = 'quadratic-formula'), 'qf-05', 'Quadratic formula', 7, 'multiple_choice', 'How many real solutions does x^2 + 4x + 8 = 0 have?', '[{"id":"a","label":"0"},{"id":"b","label":"1"},{"id":"c","label":"2"}]'::jsonb, '{"option_id":"a","accepted":["0"]}'::jsonb, 'The discriminant is 4^2 - 4(1)(8) = -16. A negative discriminant means there are no real solutions.', 'discriminant-interpretation', 'conceptual_understanding', 50)
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
