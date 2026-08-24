export const QUERY_KEYS = {
  auth: {
    root: ["auth"] as const,
    session: () => ["auth", "session"] as const,
  },
  sports: {
    root: ["sports"] as const,
    overview: () => ["sports", "overview"] as const,
  },
  band: {
    root: ["band"] as const,
    overview: () => ["band", "overview"] as const,
  },
  admin: {
    root: ["admin"] as const,
    overview: () => ["admin", "overview"] as const,
  },
} as const;
