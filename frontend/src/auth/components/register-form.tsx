"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
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
import { PasswordStrengthBar } from "./password-strength-bar";

import toast from "react-hot-toast";

function TermsLabel() {
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const openTerms = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setModalType("terms");
  };

  const openPrivacy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setModalType("privacy");
  };

  return (
    <>
      I agree to the{" "}
      <button
        type="button"
        onClick={openTerms}
        className="font-semibold text-foreground underline decoration-accent underline-offset-2"
      >
        Terms of Service
      </button>{" "}
      and{" "}
      <button
        type="button"
        onClick={openPrivacy}
        className="font-semibold text-foreground underline decoration-accent underline-offset-2"
      >
        Privacy Policy
      </button>

      <Modal open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <ModalContent className="max-w-xl max-h-[85vh] flex flex-col">
          <ModalHeader>
            <ModalTitle>
              {modalType === "terms" ? "Terms of Service" : "Privacy Policy"}
            </ModalTitle>
            <ModalDescription>
              {modalType === "terms"
                ? "Please review our terms and conditions for using the platform."
                : "Learn how we collect, use, and protect your personal information."}
            </ModalDescription>
          </ModalHeader>
          <div className="overflow-y-auto max-h-[50vh] pr-2 space-y-4 text-sm text-muted-foreground leading-relaxed">
            {modalType === "terms" ? (
              <>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">1. Acceptance of Terms</h4>
                  <p>By creating an account or using Spond, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">2. User Accounts & Responsibilities</h4>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">3. Venue & Booking Policies</h4>
                  <p>Bookings made via the platform are subject to availability, confirmation, and venue-specific guidelines. Cancellations must adhere to our standard cancellation policy.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">4. Code of Conduct</h4>
                  <p>All members and venue partners agree to treat others with respect and uphold fair play, community standards, and lawful conduct at all times.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">1. Information We Collect</h4>
                  <p>We collect information you provide directly to us when registering, such as your full name, email address, role, phone number, and venue details.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">2. How We Use Information</h4>
                  <p>We use your information to operate and improve the platform, process bookings, manage communication between members and venues, and provide security.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">3. Data Sharing & Security</h4>
                  <p>We do not sell your personal data. We implement industry-standard encryption and security measures to protect your credentials and activity.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">4. Your Rights</h4>
                  <p>You may view, update, or request deletion of your personal account information at any time via your account settings.</p>
                </div>
              </>
            )}
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalType(null)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// ── Register form ────────────────────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingData, setPendingData] = useState<RegisterFormData | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

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
      const msg = (error as any)?.message || (error instanceof Error ? error.message : "");
      const isDuplicate =
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("account with this email") ||
        error?.status === 409;

      if (isDuplicate) {
        form.setError("email", {
          type: "server",
          message: "You already have an account with this email.",
        });
      }

      dispatch(
        notificationAdded({
          title: "Failed to send OTP",
          message: isDuplicate ? "You already have an account with this email." : msg || "Something went wrong. Please try again.",
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
      setOtp("");
      setOtpError(null);
      setCountdown(60);
      dispatch(
        notificationAdded({
          title: "OTP Resent",
          message: `A new verification code has been sent to ${pendingData.email}.`,
          variant: "success",
        })
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(msg);
      dispatch(
        notificationAdded({
          title: "Failed to resend OTP",
          message: msg,
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
      
      await authService.completeSignup({
        signup_token,
        full_name: pendingData.name,
        password: pendingData.password,
        role: pendingData.role,
        accessible_modules: ["sports", "band"],
      });

      setShowOtpModal(false);
      dispatch(
        notificationAdded({
          title: `Welcome aboard, ${pendingData.name}!`,
          message: "Your account has been created successfully. Please login to continue.",
          variant: "success",
        })
      );
      let redirectUrl = ROUTES.LOGIN;
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        redirectUrl += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      }
      router.push(redirectUrl);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "";
      if (errorMsg.toLowerCase().includes("expired")) {
        setOtpError("OTP has expired. Please request a new code");
      } else {
        setOtpError("enter correct otp");
      }
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

  const onInvalid = (errors: Record<string, any>) => {
    const firstError = Object.values(errors)[0];
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
            { label: "Club Owner", value: "member" },
            { label: "Sports Venue Owner (Courts & Grounds)", value: "sports_venue_owner" },
            { label: "Band Venue Owner (Halls & Auditoriums)", value: "venue_owner" },
            { label: "Solo Artist", value: "artist" },
            { label: "Band", value: "band" },
            { label: "Client (Hire Artists & Venues)", value: "client" },
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
              We&apos;ve sent a 6-digit code to {pendingData?.email}. Enter it below to complete your registration.
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
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (otpError) setOtpError(null);
                }}
                className={otpError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {otpError && (
                <p className="text-xs font-medium text-destructive">{otpError}</p>
              )}
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
                  Didn&apos;t receive the code? {isResending ? "Resending..." : "Resend OTP"}
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
