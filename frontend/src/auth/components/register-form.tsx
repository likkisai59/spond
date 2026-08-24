"use client";

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
import { AuthDivider, SocialAuthButtons } from "./social-auth-buttons";
import { createDummyUser, dummyDelay } from "../dummy";
import { registerSchema, type RegisterFormData } from "../schemas";
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";

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

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    await dummyDelay();

    const user = createDummyUser(data.email, data.name);
    dispatch(
      notificationAdded({
        title: `Welcome aboard, ${user.firstName}!`,
        message: "Your account has been created (demo mode). Please verify your email.",
        variant: "success",
      })
    );
    router.push(ROUTES.VERIFY_EMAIL);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
        <FormPassword
          control={control}
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          description="At least 8 characters, with one letter and one number."
        />
        <FormPassword
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
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
