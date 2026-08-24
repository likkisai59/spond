import { ForgotPasswordForm } from "../components/forgot-password-form";
import { AuthPageShell } from "../components/auth-page-shell";

export function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Forgot your password?"
      description="No worries — we'll email you a reset link."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
