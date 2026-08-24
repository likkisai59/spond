"use client";

import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.03 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702"
      />
    </svg>
  );
}

export type SocialProvider = "google" | "apple";

export interface SocialAuthButtonsProps {
  className?: string;
  onProviderClick?: (provider: SocialProvider) => void;
}

export function SocialAuthButtons({
  className,
  onProviderClick,
}: SocialAuthButtonsProps) {
  const dispatch = useAppDispatch();

  const handleClick = (provider: SocialProvider) => {
    if (onProviderClick) {
      onProviderClick(provider);
      return;
    }
    dispatch(
      notificationAdded({
        title: `${provider === "google" ? "Google" : "Apple"} sign-in`,
        message: "Social sign-in will be enabled with the authentication backend.",
        variant: "info",
      })
    );
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleClick("google")}
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleClick("apple")}
      >
        <AppleIcon />
        Apple
      </Button>
    </div>
  );
}

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({
  label = "or continue with",
  className,
}: AuthDividerProps) {
  return (
    <div className={cn("relative my-6", className)} aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/70" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
