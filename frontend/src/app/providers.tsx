"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { makeStore, type AppStore } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { credentialsReceived } from "@/store/slices/auth-slice";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";
import type { User } from "@/types";

import { AuthProvider } from "@/providers/auth-provider";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export interface ProvidersProps {
  children: ReactNode;
}

function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const user = storage.get<User>(STORAGE_KEYS.USER);
    const accessToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);

    if (user && accessToken) {
      dispatch(
        credentialsReceived({
          user,
          accessToken,
          refreshToken: refreshToken ?? undefined,
        })
      );
    }
  }, [dispatch]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const [queryClient] = useState(createQueryClient);

  return (
    <ReduxProvider store={storeRef.current}>
      <AuthInitializer />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={200}>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </TooltipProvider>
          {process.env.NODE_ENV === "development" ? (
            <ReactQueryDevtools initialIsOpen={false} />
          ) : null}
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
