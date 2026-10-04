import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signUpAction } from "@/server/auth/actions";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <AuthPageShell mode="sign-up">
      <AuthForm action={signUpAction} mode="sign-up" nextPath={params.next} />
    </AuthPageShell>
  );
}
