import { hasSupabaseConfig } from "@/server/env";
import { getAccountContext } from "@/server/profile/data";
import { AppNavigation } from "@/components/app-shell/app-navigation";
import { DashboardHeader } from "@/components/app-shell/dashboard-header";

export async function FoundationShell({ children, active }: { children: React.ReactNode; active: string }) {
  const account = hasSupabaseConfig() ? await getAccountContext() : null;

  return (
    <main className="min-h-screen w-full px-4 pb-[calc(2.5rem+var(--nomi-safe-bottom))] pt-[calc(5.25rem+var(--nomi-safe-top))] sm:px-6 lg:pl-[17.5rem] lg:pr-8 lg:pt-0 xl:pr-12">
      <DashboardHeader active={active} account={account} />
      <div className="mx-auto w-full max-w-[1120px] lg:py-8">{children}</div>
      <AppNavigation active={active} account={account} />
    </main>
  );
}
