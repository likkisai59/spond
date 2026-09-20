/**
 * Axios API client — singleton instance for all BandConnect API calls.
 *
 * Interceptors:
 *   Request  — auto-attach JWT Bearer token from localStorage
 *   Response — pass errors through; do NOT redirect on 401 here
 *
 * Why the response interceptor does NOT redirect on 401:
 *   1. AuthProvider calls /auth/me during hydration. A 401 from that call
 *      just means the stored token is expired. AuthProvider calls clearAuth()
 *      and ProtectedRoute redirects after hydration completes. An interceptor
 *      redirect here creates a race condition with the hydration state machine.
 *   2. The login page itself posts to /auth/login. If that returns 401 the
 *      catch block in the login form shows the error toast — a redirect to
 *      /login from within /login creates an infinite loop in history.
 *   3. Developer mode stores a fake (non-JWT) token. The backend returns 401
 *      for it. The interceptor would wipe the dev session before the developer
 *      page can show the dev user in the UI.
 *
 * All redirect logic lives exclusively in ProtectedRoute (client-side) and
 * Next.js middleware (edge).
 */

import { siteConfig } from "@/config/site";
import axios from "axios";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";

export const api = axios.create({
  baseURL: `${siteConfig.apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT Bearer token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Pass responses and handle transparent token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const res = await axios.post(`${siteConfig.apiUrl}/api/v1/auth/refresh-token`, {
            refresh_token: refreshToken,
          });
          const sessionData = res.data?.data;
          const newAccessToken = sessionData?.access_token || sessionData?.accessToken;
          const newRefreshToken = sessionData?.refresh_token || sessionData?.refreshToken;

          if (newAccessToken) {
            storage.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            if (newRefreshToken) {
              storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          storage.remove(STORAGE_KEYS.USER);
          // if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          //   window.location.href = "/login";
          // }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        // if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        //   window.location.href = "/login";
        // }
      }
    }
    return Promise.reject(error);
  }
);
