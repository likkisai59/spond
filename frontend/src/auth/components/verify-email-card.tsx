"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, MailCheck, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { dummyDelay } from "../dummy";
import { cn } from "@/utils/cn";

const RESEND_COOLDOWN_SECONDS = 30;

type VerifyStatus = "idle" | "verifying" | "verified";

function VerifiedState() {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-elevated">
        <PartyPopper className="h-8 w-8 text-white" />
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-card">
          <BadgeCheck className="h-4 w-4 text-accent" />
        </span>
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">
          Email verified successfully
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your account is now active. Choose a product to begin managing your
          world.
        </p>
      </div>
      <Button asChild variant="accent" size="lg" className="w-full">
        <Link href={ROUTES.SELECT_PRODUCT}>Continue</Link>
      </Button>
    </div>
  );
}

export function VerifyEmailCard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setStatus("verifying");
    await dummyDelay(1200);
    setStatus("verified");
    dispatch(
      notificationAdded({
        title: "Email verified",
        message: "Your email address has been confirmed (demo mode).",
        variant: "success",
      })
    );
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    await dummyDelay();
    setIsResending(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    dispatch(
      notificationAdded({
        title: "Verification link resent",
        message: "Please check your inbox for the new link (demo mode).",
        variant: "info",
      })
    );
  };

  if (status === "verified") {
    return <VerifiedState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-soft">
          <MailCheck className="h-8 w-8 text-accent" />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-card bg-accent" />
        </span>
      </div>

      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        We sent a verification link to your email address. Click the link in the
        email, or verify directly below.
      </p>

      <div className="space-y-3">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          loading={status === "verifying"}
          onClick={handleVerify}
        >
          {status === "verifying" ? "Verifying…" : "Verify email address"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={cooldown > 0 || isResending || status === "verifying"}
          onClick={handleResend}
        >
          {isResending
            ? "Resending…"
            : cooldown > 0
              ? `Resend link in ${cooldown}s`
              : "Resend verification link"}
        </Button>

        <button
          type="button"
          onClick={() => router.push(ROUTES.LOGIN)}
          className={cn(
            "block w-full text-center text-sm font-semibold text-muted-foreground",
            "transition-colors hover:text-foreground"
          )}
        >
          Back to log in
        </button>
      </div>
    </div>
  );
}
