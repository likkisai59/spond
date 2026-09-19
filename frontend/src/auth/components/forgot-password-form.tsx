"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, KeyRound, ExternalLink } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormInput } from "@/components/forms";
import { authService } from "@/services";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import toast from "react-hot-toast";

function SentState({
  email,
  resetToken,
  onReset,
}: {
  email: string;
  resetToken: string | null;
  onReset: () => void;
}) {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-soft">
        <MailCheck className="h-8 w-8 text-accent" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Check your email</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent password reset instructions to{" "}
          <span className="font-semibold text-foreground">{email}</span>. The
          link expires in 30 minutes.
        </p>
      </div>

      {resetToken && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <KeyRound className="h-4 w-4" />
            <span>Development Mode Direct Access</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Email service is not enabled in this environment. You can use this generated reset token directly:
          </p>
          <Button asChild variant="outline" size="sm" className="w-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
            <Link href={`${ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(resetToken)}`}>
              Reset Password Now
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Button asChild variant="accent" size="lg" className="w-full">
          <Link href={ROUTES.LOGIN}>Back to log in</Link>
        </Button>
        <Button variant="ghost" className="w-full" onClick={onReset}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Use a different email
        </Button>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setErrorMessage(null);
    try {
      const res = await authService.forgotPassword({ email: data.email });
      const token = res?.resetToken || res?.reset_token || null;
      setResetToken(token);
      setSentEmail(data.email);

      toast.success("Password reset instructions sent!");
      dispatch(
        notificationAdded({
          title: "Reset link sent",
          message: `Password recovery instructions were sent to ${data.email}.`,
          variant: "success",
        })
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to send reset link. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      dispatch(
        notificationAdded({
          title: "Request failed",
          message: msg,
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

  if (sentEmail) {
    return (
      <SentState
        email={sentEmail}
        resetToken={resetToken}
        onReset={() => {
          setSentEmail(null);
          setResetToken(null);
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
        <FormInput
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          description="Enter the email address associated with your account."
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
          {isSubmitting ? "Sending…" : "Send reset link"}
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
