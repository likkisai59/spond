"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormPassword } from "@/components/forms";
import { PasswordStrengthBar } from "./password-strength-bar";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas";
import { ROUTES } from "@/constants";
import { authService } from "@/services";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import toast from "react-hot-toast";

function SuccessState() {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Password Reset Complete</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your password has been changed successfully. You can now log in using your new credentials.
        </p>
      </div>
      <Button asChild variant="accent" size="lg" className="w-full">
        <Link href={ROUTES.LOGIN}>Proceed to Log in</Link>
      </Button>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const dispatch = useAppDispatch();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const watchedPassword = useWatch({ control, name: "password" });

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) {
      toast.error("Missing reset token. Please request a new password reset link.");
      return;
    }

    try {
      await authService.resetPassword({
        token,
        new_password: data.password,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      dispatch(
        notificationAdded({
          title: "Password changed",
          message: "Your password has been reset. Please log in with your new password.",
          variant: "success",
        })
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid or expired reset token. Please request a new link.";
      toast.error(message);
      dispatch(
        notificationAdded({
          title: "Password reset failed",
          message,
          variant: "error",
        })
      );
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstError = Object.values(errors)[0] as { message?: string } | undefined;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  if (isSuccess) {
    return <SuccessState />;
  }

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </span>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No valid reset token was found in the link. It may have expired or been improperly formatted.
          </p>
        </div>
        <div className="space-y-2">
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link href={ROUTES.FORGOT_PASSWORD}>Request New Reset Link</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={ROUTES.LOGIN}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to log in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
        <div>
          <FormPassword
            control={control}
            name="password"
            label="New Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={watchedPassword || ""} />
        </div>

        <FormPassword
          control={control}
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          {isSubmitting ? "Resetting password…" : "Reset password"}
        </Button>

        <Button asChild variant="ghost" className="w-full">
          <Link href={ROUTES.LOGIN}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to log in
          </Link>
        </Button>
      </form>
    </Form>
  );
}
