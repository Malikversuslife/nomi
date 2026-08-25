# Milestone 2 Security Verification

These checks require a configured Supabase project with the migrations applied.

## RLS Expectations

- `subjects` and `topics` are readable by authenticated learners only when active.
- Canonical curriculum tables have no client insert, update, or delete policies.
- `profiles.id` must equal `auth.uid()` for select, insert, and update.
- Learner-owned tables require `user_id = auth.uid()` for select and allowed writes.
- `practice_attempts` is append-oriented; no update/delete policy is provided to authenticated clients.
- `tutor_messages.metadata` rejects `chain_of_thought` and `hidden_reasoning` keys.

## Manual Isolation Checks

1. Create User A and User B through Supabase Auth.
2. Sign in as User A and create/read User A profile, learner subjects, topic progress, attempts, misconception state, sessions, tutor threads, and tutor messages.
3. In the SQL editor or a test client authenticated as User A, attempt to select rows where `user_id` or profile `id` belongs to User B.
4. Confirm every User B query returns zero rows or is denied by RLS.
5. Confirm User A cannot write to `subjects` or `topics` with the anon/authenticated client.

Automated RLS tests should be added once local Supabase or project test credentials are available.
