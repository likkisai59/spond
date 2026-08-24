import Link from "next/link";
import { Zap } from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <Zap className="h-5 w-5 text-white" />
    </span>
  );
}

export interface LogoProps {
  href?: string;
  inverted?: boolean;
  className?: string;
}

export function Logo({ href = "/", inverted = false, className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      <LogoMark />
      <span
        className={cn(
          "text-lg font-extrabold tracking-tight",
          inverted ? "text-white" : "text-primary"
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}
