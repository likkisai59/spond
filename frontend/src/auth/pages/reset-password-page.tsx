"use client";

import { Suspense } from "react";
import { ResetPasswordForm } from "../components/reset-password-form";
import { AuthPageShell } from "../components/auth-page-shell";

export function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Reset your password"
      description="Choose a strong new password for your account."
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading reset form…
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
