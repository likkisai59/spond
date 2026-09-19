"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/selectors";
import {
  authFailed,
  authReset,
  authStatusChanged,
  credentialsReceived,
  loggedOut,
  userUpdated,
} from "@/store/slices/auth-slice";
import type { AuthSession, User } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";
import { authService } from "@/services";
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: ReturnType<typeof selectAuthStatus>;
  error: ReturnType<typeof selectAuthError>;
  setCredentials: (session: AuthSession) => void;
  setUser: (user: User) => void;
  setStatus: (status: "idle" | "loading" | "succeeded" | "failed") => void;
  setError: (error: string) => void;
  reset: () => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const setCredentials = useCallback(
    (session: AuthSession) => dispatch(credentialsReceived(session)),
    [dispatch]
  );
  const setUser = useCallback(
    (nextUser: User) => dispatch(userUpdated(nextUser)),
    [dispatch]
  );
  const setStatus = useCallback(
    (nextStatus: "idle" | "loading" | "succeeded" | "failed") =>
      dispatch(authStatusChanged(nextStatus)),
    [dispatch]
  );
  const setError = useCallback(
    (nextError: string) => dispatch(authFailed(nextError)),
    [dispatch]
  );
  const reset = useCallback(() => dispatch(authReset()), [dispatch]);
  const logout = useCallback(async () => {
    try {
      const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      dispatch(loggedOut());
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading: status === "loading",
    status,
    error,
    setCredentials,
    setUser,
    setStatus,
    setError,
    reset,
    logout,
  };
}
