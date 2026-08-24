import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/brand";
import { APP_NAME } from "@/constants/app";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl" />

        <Logo inverted />

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            One platform.
            <br />
            <span className="text-brand-gradient">Two products.</span>
          </h2>
          <p className="text-base leading-relaxed text-white/70">
            Manage your sports organization and grow your band career — all from
            a single, unified account.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      <div className="relative flex flex-col">
        <Link
          href="/"
          className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:left-8 lg:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
