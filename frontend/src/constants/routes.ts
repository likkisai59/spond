export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: "/verify-email",
  SELECT_PRODUCT: "/select-product",
  SPORTS: "/sports",
  SPORTS_DASHBOARD: "/sports/dashboard",
  SPORTS_GROUPS: "/sports/groups",
  SPORTS_GROUPS_CREATE: "/sports/groups/create",
  SPORTS_EVENTS: "/sports/events",
  SPORTS_EVENTS_CREATE: "/sports/events/create",
  SPORTS_POLLS: "/sports/polls",
  SPORTS_POLLS_CREATE: "/sports/polls/create",
  SPORTS_PAYMENTS: "/sports/payments",
  SPORTS_PAYMENTS_CREATE: "/sports/payments/create",
  SPORTS_MESSAGES: "/sports/messages",
  SPORTS_FILES: "/sports/files",
  SPORTS_MEMBERS: "/sports/members",
  SPORTS_ATTENDANCE: "/sports/attendance",
  SPORTS_VENUES: "/sports/venues",
  SPORTS_BOOKINGS: "/sports/bookings",
  SPORTS_STATISTICS: "/sports/statistics",
  SPORTS_NOTIFICATIONS: "/sports/notifications",
  SPORTS_SETTINGS: "/sports/settings",
  BAND: "/band",
  BAND_DASHBOARD: "/band/dashboard",
  BAND_ARTISTS: "/band/artists",
  BAND_BANDS: "/band/bands",
  BAND_VENUES: "/band/venues",
  BAND_BOOKINGS: "/band/bookings",
  BAND_REVIEWS: "/band/reviews",
  BAND_SETTINGS: "/band/settings",
  BAND_SEARCH: "/band/search",
  ADMIN: "/admin",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function sportsRoute(
  path: keyof typeof ROUTES | string,
  ...segments: (string | number)[]
): string {
  return [ROUTES[path as keyof typeof ROUTES] ?? path, ...segments]
    .filter(Boolean)
    .join("/");
}
