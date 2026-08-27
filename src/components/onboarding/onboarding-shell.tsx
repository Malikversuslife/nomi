export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[680px] flex-col justify-center px-5 py-10">
      {children}
    </main>
  );
}