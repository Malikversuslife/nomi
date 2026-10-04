import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signInAction } from "@/server/auth/actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthPageShell mode="sign-in">
      <AuthForm action={signInAction} mode="sign-in" nextPath={params.next} callbackError={params.error === "auth_callback"} />
    </AuthPageShell>
  );
}
