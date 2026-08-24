import { VerifyEmailCard } from "../components/verify-email-card";
import { AuthPageShell } from "../components/auth-page-shell";

export function VerifyEmailPage() {
  return (
    <AuthPageShell
      title="Verify your email"
      description="One last step to activate your account."
    >
      <VerifyEmailCard />
    </AuthPageShell>
  );
}
