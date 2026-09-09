"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormCheckbox,
  FormInput,
  FormPassword,
  FormSelect,
} from "@/components/forms";
import { AuthDivider, SocialAuthButtons } from "./social-auth-buttons";
import { authService } from "@/services";
import { registerSchema, type RegisterFormData } from "../schemas";
import { ROUTES, getDefaultRouteForRole } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { credentialsReceived } from "@/store/slices/auth-slice";
import { getPasswordStrength } from "@/utils/validations";
import { PasswordStrengthBar } from "./password-strength-bar";

import toast from "react-hot-toast";

function TermsLabel() {
  const dispatch = useAppDispatch();

  const openDocument = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(
      notificationAdded({
        title: "Legal documents",
        message: "Terms of Service and Privacy Policy will be published at launch.",
        variant: "info",
      })
    );
  };

  return (
    <>
      I agree to the{" "}
      <button
        type="button"
        onClick={openDocument}
        className="font-semibold text-foreground underline decoration-accent underline-offset-2"
      >
        Terms of Service
      </button>{" "}
      and{" "}
      <button
        type="button"
        onClick={openDocument}
        className="font-semibold text-foreground underline decoration-accent underline-offset-2"
      >
        Privacy Policy
      </button>
    </>
  );
}

// ── Register form ────────────────────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client",
      terms: true,
    },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  // Watch password live for the strength bar
  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await authService.register({
        full_name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        accessible_modules: ["sports", "band"],
      });

      toast.success(`Welcome aboard, ${data.name}! Please log in.`);
      dispatch(
        notificationAdded({
          title: `Welcome aboard, ${data.name}!`,
          message: "Your account has been created successfully. Please log in.",
          variant: "success",
        })
      );
      router.push(ROUTES.LOGIN);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(msg);
      dispatch(
        notificationAdded({
          title: "Registration failed",
          message: msg,
          variant: "error",
        })
      );
    }
  };

  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
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
          name="name"
          label="Full name"
          placeholder="Jane Cooper"
          autoComplete="name"
        />
        <FormInput
          control={control}
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <div>
          <FormPassword
            control={control}
            name="password"
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={passwordValue ?? ""} />
        </div>
        <FormPassword
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
        <FormSelect
          control={control}
          name="role"
          label="Account type"
          options={[
            { label: "Client (Hire Artists & Venues)", value: "client" },
            { label: "Solo Artist", value: "artist" },
            { label: "Band", value: "band" },
            { label: "Venue Owner", value: "venue_owner" },
            { label: "Player / Member (Sports)", value: "member" },
          ]}
        />
        <FormCheckbox control={control} name="terms" label={<TermsLabel />} />
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        </form>
      </Form>

      <AuthDivider />
      <SocialAuthButtons />
    </div>
  );
}
