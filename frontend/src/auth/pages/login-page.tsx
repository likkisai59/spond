import { LoginForm } from "../components/login-form";
import { AuthPageShell, authFooterLink } from "../components/auth-page-shell";
import { ROUTES } from "@/constants";

export function LoginPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  let registerUrl = ROUTES.REGISTER;
  if (searchParams?.callbackUrl) {
    registerUrl += `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl as string)}`;
  }

  const footer = authFooterLink("Don't have an account?", "Create one", registerUrl);

  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to access your sports and entertainment workspaces."
      footer={footer}
    >
      <LoginForm />
    </AuthPageShell>
  );
}
