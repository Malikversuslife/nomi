import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function NomiGreeting({ name }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="mb-5 flex items-center gap-4 sm:mb-6 sm:justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nomi-purple-600 mb-0.5 sm:text-sm">
          {greeting}{name ? `, ${name}` : ""}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-[-0.04em] text-nomi-ink sm:text-3xl">
          Ready to keep going?
        </h1>
      </div>
      <div className="flex-shrink-0">
        <NomiMascot state="encouraging" size={56} className="sm:hidden" />
        <NomiMascot state="encouraging" size={72} className="hidden sm:block" />
      </div>
    </section>
  );
}
