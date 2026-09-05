import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signInAction } from "@/server/auth/actions";

export default function SignInPage() {
  return (
    <AuthPageShell mode="sign-in">
      <AuthForm action={signInAction} mode="sign-in" />
    </AuthPageShell>
  );
}
