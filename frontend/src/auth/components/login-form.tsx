"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormCheckbox,
  FormInput,
  FormPassword,
} from "@/components/forms";
import {
  AuthDivider,
  SocialAuthButtons,
} from "./social-auth-buttons";
import { authService } from "@/services";
import { loginSchema, type LoginFormData } from "../schemas";
import { ROUTES, getDefaultRouteForRole } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { credentialsReceived } from "@/store/slices/auth-slice";

import toast from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setErrorMessage(null);
    try {
      const session = await authService.login({
        email: data.email,
        password: data.password,
      });

      dispatch(credentialsReceived(session));
      toast.success("Welcome back!");
      dispatch(
        notificationAdded({
          title: "Welcome back!",
          message: "You have been signed in.",
          variant: "success",
        })
      );
      const callbackUrl = searchParams.get("callbackUrl");
      const redirectUrl = callbackUrl || getDefaultRouteForRole(session.user.role);
      
      router.push(redirectUrl);
      window.location.href = redirectUrl;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Invalid email or password";
      setErrorMessage(msg);
      toast.error(msg);
      dispatch(
        notificationAdded({
          title: "Login failed",
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

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
        <FormInput
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormPassword
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FormCheckbox control={control} name="rememberMe" label="Remember me" />
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-semibold text-accent transition-opacity hover:opacity-80"
          >
            Forgot password?
          </Link>
        </div>
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
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        </form>
      </Form>

      <AuthDivider />
      <SocialAuthButtons />
    </div>
  );
}
