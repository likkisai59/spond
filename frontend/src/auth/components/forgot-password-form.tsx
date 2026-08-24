"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormInput } from "@/components/forms";
import { dummyDelay } from "../dummy";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";

function SentState({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-soft">
        <MailCheck className="h-8 w-8 text-accent" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Check your email</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a password reset link to{" "}
          <span className="font-semibold text-foreground">{email}</span>. The
          link expires in 30 minutes.
        </p>
      </div>
      <div className="space-y-2">
        <Button asChild variant="accent" size="lg" className="w-full">
          <Link href={ROUTES.LOGIN}>Back to log in</Link>
        </Button>
        <Button variant="ghost" className="w-full" onClick={onReset}>
          <ArrowLeft />
          Use a different email
        </Button>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    await dummyDelay();
    dispatch(
      notificationAdded({
        title: "Reset link sent",
        message: `Password recovery instructions were sent to ${data.email} (demo mode).`,
        variant: "success",
      })
    );
    setSentEmail(data.email);
  };

  if (sentEmail) {
    return (
      <SentState email={sentEmail} onReset={() => setSentEmail(null)} />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormInput
        control={control}
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        description="Enter the email address associated with your account."
      />
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
          <ArrowLeft />
          Back to log in
        </Link>
      </Button>
      </form>
    </Form>
  );
}
