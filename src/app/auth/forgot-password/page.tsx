import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { requestPasswordRecoveryAction } from "@/server/auth/actions";
export default function ForgotPasswordPage() { return <AuthPageShell mode="recovery"><RecoveryForm action={requestPasswordRecoveryAction} /></AuthPageShell>; }
