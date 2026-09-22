import type { BaseEntity } from "./common";

export const ROLES = [
  "user",
  "admin",
  "super-admin",
  "super_admin",
  "platform_admin",
  "sports_admin",
  "band_admin",
  "coach",
  "venue_owner",
  "sports_venue_owner",
  "artist",
  "band_manager",
  "player",
  "member",
  "client",
  "band",
  "owner",
] as const;
export type Role = (typeof ROLES)[number];

export type UserStatus = "active" | "inactive" | "pending";

export interface User extends BaseEntity {
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  full_name?: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
