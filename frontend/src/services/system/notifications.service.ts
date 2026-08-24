import { apiClient } from "../api-client";
import type { ApiResponse, AppNotification } from "@/types";

export interface NotificationsService {
  list(): Promise<ApiResponse<{ items: AppNotification[] }>>;
  getById(id: string): Promise<ApiResponse<AppNotification>>;
  markRead(id: string): Promise<ApiResponse<AppNotification>>;
  markAllRead(): Promise<ApiResponse<void>>;
  remove(id: string): Promise<ApiResponse<void>>;
  clearAll(): Promise<ApiResponse<void>>;
}

export const notificationsService: NotificationsService = {
  list: async () => apiClient.get("/v1/notifications"),
  getById: async (id) => apiClient.get(`/v1/notifications/${id}`),
  markRead: async (id) => apiClient.put(`/v1/notifications/${id}/read`),
  markAllRead: async () => apiClient.put("/v1/notifications/read-all"),
  remove: async (id) => apiClient.delete(`/v1/notifications/${id}`),
  clearAll: async () => apiClient.delete("/v1/notifications/clear-all"),
};
