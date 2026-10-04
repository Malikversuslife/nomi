import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { updatePasswordAction } from "@/server/auth/actions";
export default function UpdatePasswordPage() { return <AuthPageShell mode="update-password"><UpdatePasswordForm action={updatePasswordAction} /></AuthPageShell>; }
