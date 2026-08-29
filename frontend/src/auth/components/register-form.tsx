"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { credentialsReceived } from "@/store/slices/auth-slice";

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
      role: "member",
      terms: false,
    },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingData, setPendingData] = useState<RegisterFormData | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOtpModal, countdown]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await authService.requestOtp({ email: data.email });
      setPendingData(data);
      setCountdown(60);
      setShowOtpModal(true);
      dispatch(
        notificationAdded({
          title: "OTP Sent",
          message: `Please check your email (${data.email}) for the verification code.`,
          variant: "success",
        })
      );
    } catch (error: unknown) {
      dispatch(
        notificationAdded({
          title: "Failed to send OTP",
          message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          variant: "error",
        })
      );
    }
  };

  const handleResendOtp = async () => {
    if (!pendingData) return;
    setIsResending(true);
    try {
      await authService.requestOtp({ email: pendingData.email });
      setCountdown(60);
      dispatch(
        notificationAdded({
          title: "OTP Resent",
          message: `A new verification code has been sent to ${pendingData.email}.`,
          variant: "success",
        })
      );
    } catch (error: unknown) {
      dispatch(
        notificationAdded({
          title: "Failed to resend OTP",
          message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          variant: "error",
        })
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingData || !otp) return;
    setIsVerifying(true);
    try {
      const { signup_token } = await authService.verifyOtp({ email: pendingData.email, otp });
      
      const session = await authService.completeSignup({
        signup_token,
        full_name: pendingData.name,
        password: pendingData.password,
        role: pendingData.role,
        accessible_modules: ["sports", "band"],
      });

      dispatch(credentialsReceived(session));
      setShowOtpModal(false);
      dispatch(
        notificationAdded({
          title: `Welcome aboard, ${pendingData.name}!`,
          message: "Your account has been created successfully.",
          variant: "success",
        })
      );
      router.push(ROUTES.SELECT_PRODUCT);
    } catch (error: unknown) {
      dispatch(
        notificationAdded({
          title: "Verification failed",
          message: error instanceof Error ? error.message : "Invalid OTP or something went wrong.",
          variant: "error",
        })
      );
    } finally {
      setIsVerifying(false);
    }
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
        <FormSelect
          control={control}
          name="role"
          label="Account type"
          options={[
            { label: "Player / Member", value: "member" },
            { label: "Venue Owner", value: "venue_owner" },
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

      <Modal open={showOtpModal} onOpenChange={setShowOtpModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Verify your email</ModalTitle>
            <ModalDescription>
              We've sent a 6-digit code to {pendingData?.email}. Enter it below to complete your registration.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input 
                id="otp" 
                placeholder="000000" 
                maxLength={6} 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="text-sm text-muted-foreground pt-2">
              {countdown > 0 ? (
                <p>Resend OTP in 00:{countdown.toString().padStart(2, "0")}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-semibold text-accent hover:opacity-80 disabled:opacity-50 transition-opacity"
                >
                  Didn't receive the code? {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowOtpModal(false)} disabled={isVerifying}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleVerifyOtp} loading={isVerifying} disabled={otp.length !== 6}>
              Verify & Create Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
