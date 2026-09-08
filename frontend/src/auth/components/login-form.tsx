"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { credentialsReceived } from "@/store/slices/auth-slice";

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
      dispatch(
        notificationAdded({
          title: "Welcome back!",
          message: "You have been signed in.",
          variant: "success",
        })
      );
      router.push(ROUTES.SELECT_PRODUCT);
    } catch (error: unknown) {
      setErrorMessage("Invalid email or password");
      dispatch(
        notificationAdded({
          title: "Login failed",
          message: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
          variant: "error",
        })
      );
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
