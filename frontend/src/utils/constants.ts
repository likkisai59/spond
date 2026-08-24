export const STORAGE_KEYS = {
  ACCESS_TOKEN: "platform.accessToken",
  REFRESH_TOKEN: "platform.refreshToken",
  SIDEBAR_COLLAPSED: "platform.sidebarCollapsed",
} as const;

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export const API_TIMEOUT_MS = 30_000;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "development";
