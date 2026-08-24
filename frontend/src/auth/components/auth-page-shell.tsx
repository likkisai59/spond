import Link from "next/link";
import type { ReactNode } from "react";
import { AuthCard } from "@/auth/components/auth-card";
import { ROUTES } from "@/constants";

export interface AuthPageShellProps {
  title: string;
  description: string;
  footer?: ReactNode;
  children: React.ReactNode;
}

export function AuthPageShell({
  title,
  description,
  footer,
  children,
}: AuthPageShellProps) {
  return (
    <AuthCard title={title} description={description} footer={footer}>
      {children}
    </AuthCard>
  );
}

export function authFooterLink(
  label: string,
  linkLabel: string,
  href: string
): ReactNode {
  return (
    <span>
      {label}{" "}
      <Link
        href={href}
        className="font-bold text-accent transition-opacity hover:opacity-80"
      >
        {linkLabel}
      </Link>
    </span>
  );
}

export const loginFooter = authFooterLink(
  "Don't have an account?",
  "Create one",
  ROUTES.REGISTER
);
