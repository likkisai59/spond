"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";

interface RoleGuardProps {
  allowedRoles: ("client" | "artist" | "venue_owner" | "admin")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const isAllowed = user?.role && allowedRoles.includes(user.role as any);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
