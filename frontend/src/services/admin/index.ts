import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Paginated, PaginationQuery, User } from "@/types";

export interface AdminUserQuery extends PaginationQuery {
  role?: string;
  status?: string;
}

export interface AdminService {
  getOverview(): Promise<ApiResponse<unknown>>;
  listUsers(query: AdminUserQuery): Promise<ApiResponse<Paginated<User>>>;
}

export const adminService: AdminService = {
  getOverview: () => notImplemented("adminService.getOverview"),
  listUsers: () => notImplemented("adminService.listUsers"),
};
