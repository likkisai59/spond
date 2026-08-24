import { LoginForm } from "../components/login-form";
import { AuthPageShell, loginFooter } from "../components/auth-page-shell";

export function LoginPage() {
  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to access your sports and music workspaces."
      footer={loginFooter}
    >
      <LoginForm />
    </AuthPageShell>
  );
}
