import type { BaseEntity } from "./common";

export const ROLES = ["user", "admin", "super-admin"] as const;
export type Role = (typeof ROLES)[number];

export type UserStatus = "active" | "inactive" | "pending";

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
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
