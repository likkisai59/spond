"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormPassword } from "@/components/forms";
import { authService } from "@/services";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas";
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";

function SuccessState() {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Password reset complete!</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
      </div>
      <Button asChild variant="accent" size="lg" className="w-full">
        <Link href={ROUTES.LOGIN}>Proceed to Sign In</Link>
      </Button>
    </div>
  );
}

function MissingTokenState() {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Invalid or Missing Link</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This password reset link is invalid, expired, or missing the verification token. Please request a new link.
        </p>
      </div>
      <Button asChild variant="accent" size="lg" className="w-full">
        <Link href={ROUTES.FORGOT_PASSWORD}>Request New Reset Link</Link>
      </Button>
    </div>
  );
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  if (!token) {
    return <MissingTokenState />;
  }

  if (isSuccess) {
    return <SuccessState />;
  }

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    setErrorMessage(null);
    try {
      await authService.resetPassword({
        token,
        new_password: data.password,
      });
      dispatch(
        notificationAdded({
          title: "Password reset",
          message: "Your password has been updated successfully.",
          variant: "success",
        })
      );
      setIsSuccess(true);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to reset password. The link may have expired.";
      setErrorMessage(msg);
      dispatch(
        notificationAdded({
          title: "Reset failed",
          message: msg,
          variant: "error",
        })
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormPassword
          control={control}
          name="password"
          label="New Password"
          placeholder="Enter new password"
          autoComplete="new-password"
        />
        <FormPassword
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />
        {errorMessage && (
          <p className="text-center text-xs sm:text-sm font-semibold text-destructive animate-fade-in-up">
            {errorMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={ROUTES.LOGIN}>
            <ArrowLeft />
            Back to log in
          </Link>
        </Button>
      </form>
    </Form>
  );
}
