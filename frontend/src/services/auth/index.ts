import { apiClient } from "@/services/api-client";
import type { AuthSession, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  accessible_modules: string[];
  role?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  logout(payload: LogoutPayload): Promise<void>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string; resetToken?: string | null; reset_token?: string | null }>;
  resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }>;
  refreshToken(payload: RefreshTokenPayload): Promise<AuthSession>;
  getCurrentUser(): Promise<User>;
}

export const authService: AuthService = {
  login: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/login", payload);
    const rawUser = data.data?.user || {};
    const fullName = rawUser.full_name || rawUser.name || "";
    const [first, ...rest] = fullName.split(" ");
    const user = {
      ...rawUser,
      name: fullName,
      firstName: rawUser.firstName || first || "User",
      lastName: rawUser.lastName || rest.join(" ") || "",
    };
    return {
      user,
      accessToken: data.data?.access_token || data.data?.accessToken,
      refreshToken: data.data?.refresh_token || data.data?.refreshToken,
    } as AuthSession;
  },
  register: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/register", payload);
    const rawUser = data.data?.user || {};
    const fullName = rawUser.full_name || rawUser.name || "";
    const [first, ...rest] = fullName.split(" ");
    const user = {
      ...rawUser,
      name: fullName,
      firstName: rawUser.firstName || first || "User",
      lastName: rawUser.lastName || rest.join(" ") || "",
    };
    return {
      user,
      accessToken: data.data?.access_token || data.data?.accessToken,
      refreshToken: data.data?.refresh_token || data.data?.refreshToken,
    } as AuthSession;
  },
  logout: async (payload) => {
    await apiClient.post("/api/v1/auth/logout", payload);
  },
  forgotPassword: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: { message: string; resetToken?: string | null; reset_token?: string | null } }>("/api/v1/auth/forgot-password", payload);
    return data.data;
  },
  resetPassword: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: { message: string } }>("/api/v1/auth/reset-password", payload);
    return data.data;
  },
  refreshToken: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/refresh-token", payload);
    const rawUser = data.data?.user || {};
    const fullName = rawUser.full_name || rawUser.name || "";
    const [first, ...rest] = fullName.split(" ");
    const user = {
      ...rawUser,
      name: fullName,
      firstName: rawUser.firstName || first || "User",
      lastName: rawUser.lastName || rest.join(" ") || "",
    };
    return {
      user,
      accessToken: data.data?.access_token || data.data?.accessToken,
      refreshToken: data.data?.refresh_token || data.data?.refreshToken,
    } as AuthSession;
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get<{ status: string; data: User }>("/api/v1/auth/me");
    return data.data;
  },
};
