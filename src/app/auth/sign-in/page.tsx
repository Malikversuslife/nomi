import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/server/auth/actions";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Nomi</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Welcome back</h1>
        <p className="text-nomi-muted">Sign in to verify the learner-owned data foundation.</p>
      </div>
      <AuthForm action={signInAction} mode="sign-in" />
    </main>
  );
}
