import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { signUpAction } from "@/server/auth/actions";

export default function SignUpPage() {
  return (
    <AuthPageShell mode="sign-up">
      <AuthForm action={signUpAction} mode="sign-up" />
    </AuthPageShell>
  );
}
