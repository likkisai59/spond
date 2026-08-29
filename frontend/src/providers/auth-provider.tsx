"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks";
import { authService } from "@/services";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/utils/constants";
import { usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, setStatus, reset } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Run only on /sports routes
      if (!pathname?.startsWith("/sports")) {
        if (mounted) setIsInitializing(false);
        return;
      }
      const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        if (mounted) setIsInitializing(false);
        return;
      }

      if (user) {
        if (mounted) setIsInitializing(false);
        return;
      }

      setStatus("loading");
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setStatus("succeeded");
        }
      } catch (error) {
        console.error("Failed to restore session", error);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        if (mounted) reset();
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [user, setUser, setStatus, reset, pathname]);

  return <>{children}</>;
}
