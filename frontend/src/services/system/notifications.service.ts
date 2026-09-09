import { api } from "../api";

// Notifications API — uses the same axios instance as all other services
// (baseURL: http://localhost:8000/api/v1)

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  event_type?: string;
  module?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  list: async (): Promise<{ items: AppNotification[] }> => {
    const res = await api.get<any>("/notifications");
    return res.data?.data ?? { items: [] };
  },

  getById: async (id: string): Promise<AppNotification> => {
    const res = await api.get<any>(`/notifications/${id}`);
    return res.data?.data;
  },

  markRead: async (id: string): Promise<AppNotification> => {
    const res = await api.put<any>(`/notifications/${id}/read`);
    return res.data?.data;
  },

  markAllRead: async (): Promise<void> => {
    await api.put("/notifications/read-all");
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete("/notifications/clear-all");
  },
};
