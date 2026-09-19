"use client";

/**
 * ProtectedRoute — client-side authentication and RBAC guard.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader as Spinner } from "@/components/ui/loader";


type Role = "client" | "artist" | "venue_owner" | "admin" | "super-admin" | "user" | "band";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isPending = authLoading || !mounted;

  React.useEffect(() => {
    if (isPending) return;

    // If real authenticated session exists
    if (user) {
      const userRole = String(user.role || "").toLowerCase();
      if (allowedRoles && userRole && !allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        router.replace("/");
      }
      return;
    }

    // Unauthenticated fallback
    router.replace("/login");
  }, [user, isPending, allowedRoles, router]);

  const isAuthorized = React.useMemo(() => {
    if (isPending) return false;

    if (user) {
      if (!allowedRoles) return true;
      const userRole = String(user.role || "").toLowerCase();
      return Boolean(userRole && allowedRoles.map((r) => r.toLowerCase()).includes(userRole));
    }

    return false;
  }, [isPending, user, allowedRoles]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
