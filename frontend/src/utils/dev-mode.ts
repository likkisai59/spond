import toast from "react-hot-toast";

export function isDevMode(): boolean {
  return false;
}

export const mockUsers = {
  admin: { id: "", name: "", email: "", role: "", roles: [], permissions: [] },
  artist: { id: "", name: "", email: "", role: "", roles: [], permissions: [] },
  venue_owner: { id: "", name: "", email: "", role: "", roles: [], permissions: [] },
  client: { id: "", name: "", email: "", role: "", roles: [], permissions: [] },
};

export function makeDevToken(role: string, id: string) {
  return `dev-${role}-${id}`;
}

export function isPreviewActive(): boolean {
  return false;
}

export function getPreviewRole(): string | null {
  return null;
}

export function toastMutationBlocked(): Promise<never> {
  toast.error("Authentication is required for this action.");
  return Promise.reject(new Error("Preview mode is disabled."));
}
