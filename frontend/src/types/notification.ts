export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  variant: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export type NotificationVariant = AppNotification["variant"];
