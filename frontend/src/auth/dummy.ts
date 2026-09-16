import type { User } from "@/types";
import { capitalize, sleep } from "@/utils/helpers";

export const DUMMY_ACCESS_TOKEN = "demo-access-token";
export const DUMMY_REFRESH_TOKEN = "demo-refresh-token";

export function createDummyUser(email: string, name?: string): User {
  const fallbackName = email.split("@")[0].replace(/[._-]+/g, " ");
  const displayName = name?.trim() || capitalize(fallbackName) || "Demo User";
  const now = new Date().toISOString();

  return {
    id: `usr_demo_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    email,
    fullName: displayName,
    role: "user",
    status: "active",
    emailVerified: true,
  };
}

export async function dummyDelay(ms: number = 900): Promise<void> {
  await sleep(ms);
}
