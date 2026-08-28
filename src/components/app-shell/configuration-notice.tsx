export function ConfigurationNotice() {
  return (
    <section className="rounded-[var(--nomi-radius-large)] border border-nomi-warning-500/40 bg-nomi-warning-100 p-5 text-nomi-ink">
      <h2 className="font-display text-2xl font-bold">Supabase configuration needed</h2>
      <p className="mt-2 text-sm leading-6">
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to run live authentication and data checks. No secrets should be committed.
      </p>
    </section>
  );
}
