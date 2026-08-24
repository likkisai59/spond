import { RegisterForm } from "../components/register-form";
import { AuthPageShell, authFooterLink } from "../components/auth-page-shell";
import { ROUTES } from "@/constants";

export function RegisterPage() {
  return (
    <AuthPageShell
      title="Create your account"
      description="One account for every product on the platform."
      footer={authFooterLink(
        "Already have an account?",
        "Sign in",
        ROUTES.LOGIN
      )}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
