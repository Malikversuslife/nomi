import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/server/auth/actions";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nomi-purple-600">Meet Nomi</p>
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em]">Create your learner profile</h1>
        <p className="text-nomi-muted">This is only the auth/profile foundation, not onboarding.</p>
      </div>
      <AuthForm action={signUpAction} mode="sign-up" />
    </main>
  );
}
