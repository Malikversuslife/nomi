import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function NomiGreeting({ name }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="mb-5 flex items-center justify-between gap-4 sm:mb-8">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-nomi-muted">
          {greeting}
          {name ? `, ${name}` : ""}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-4xl">
          Ready to keep going?
        </h1>
      </div>
      <NomiMascot state="encouraging" size={56} className="shrink-0 sm:hidden" />
      <NomiMascot state="encouraging" size={72} className="hidden shrink-0 sm:block" />
    </section>
  );
}