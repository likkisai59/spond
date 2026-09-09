"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Basic stub: if logged in, has permission
  const hasPermission = (p: string) => !!user;

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
