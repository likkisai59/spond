"use client";

/**
 * ProtectedRoute — client-side authentication and RBAC guard.
 *
 * isPending stays true while:
 *  - the component hasn't mounted yet (SSR/hydration)
 *  - the auth store is actively loading (token refresh etc.)
 *  - the auth status is still "idle" with no user (store just created, pre-hydration)
 *
 * This prevents spurious unauthenticated redirects in the brief window between
 * router.push() completing and the Redux store being fully populated.
 */

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppSelector } from "@/store/hooks";
import { selectAuthStatus } from "@/store/selectors";
import { Loader as Spinner } from "@/components/ui/loader";


type Role = "client" | "artist" | "venue_owner" | "admin" | "super-admin" | "user" | "band" | "member" | "sports_venue_owner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const authStatus = useAppSelector(selectAuthStatus);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Treat "idle with no user" as pending — this covers the window between
  // a successful login dispatch and the route component fully re-rendering,
  // preventing a false "unauthenticated" redirect.
  const isAuthPending = authLoading || (authStatus === "idle" && !user);
  const isPending = isAuthPending || !mounted;

  React.useEffect(() => {
    if (isPending) return;

    // If real authenticated session exists
    if (user) {
      const userRole = String(user.role || "").toLowerCase();
      // Allow base "user" role to access everything, or check specific roles
      if (allowedRoles && userRole && userRole !== "user" && !allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        router.replace("/");
      }
      return;
    }

    // Unauthenticated fallback
    let loginUrl = "/login";
    if (pathname && pathname !== "/") {
      const search = searchParams?.toString();
      const currentUrl = search ? `${pathname}?${search}` : pathname;
      loginUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
    }
    router.replace(loginUrl);
  }, [user, isPending, allowedRoles, router, pathname, searchParams]);

  const isAuthorized = React.useMemo(() => {
    if (isPending) return false;

    if (user) {
      if (!allowedRoles) return true;
      const userRole = String(user.role || "").toLowerCase();
      if (userRole === "user") return true;
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
