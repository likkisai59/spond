import type { RootState } from "@/store";

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.accessToken !== null;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectSidebarCollapsed = (state: RootState) =>
  state.ui.sidebarCollapsed;
export const selectMobileNavOpen = (state: RootState) =>
  state.ui.mobileNavOpen;

export const selectNotifications = (state: RootState) =>
  state.notifications.notifications;
export const selectUnreadNotificationsCount = (state: RootState) =>
  state.notifications.notifications.filter((n) => !n.read).length;

export const selectFiles = (state: RootState) => state.sports.files.files;
