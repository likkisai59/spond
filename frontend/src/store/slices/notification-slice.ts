import {
  createSlice,
  createAsyncThunk,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AppNotification, NotificationVariant } from "@/types";
import { notificationsService } from "@/services/system/notifications.service";

export interface NotificationInput {
  title: string;
  message?: string;
  variant?: NotificationVariant;
}

export interface NotificationState {
  notifications: AppNotification[];
}

const MAX_NOTIFICATIONS = 50;

const initialState: NotificationState = {
  notifications: [],
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    const res = await notificationsService.list();
    type NotificationPayload = { id?: string; _id?: string; title: string; message: string; variant?: "info" | "success" | "warning" | "error"; is_read: boolean; created_at: string; module?: string };
    return res.items.map((n: NotificationPayload) => ({
      id: n.id || n._id,
      title: n.title,
      message: n.message,
      variant: n.variant || "info",
      read: n.is_read,
      createdAt: n.created_at,
      module: n.module,
    })) as AppNotification[];
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { dispatch }) => {
    await notificationsService.markAllRead();
    dispatch(notificationsMarkedAllAsRead());
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { dispatch }) => {
    try {
      await notificationsService.clearAll();
      dispatch(notificationSlice.actions.notificationsCleared());
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown } };
      console.error("Failed to clear notifications:", err?.response?.data || error);
      throw error;
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationAdded: {
      reducer(state, action: PayloadAction<AppNotification>) {
        state.notifications.unshift(action.payload);
        if (state.notifications.length > MAX_NOTIFICATIONS) {
          state.notifications.length = MAX_NOTIFICATIONS;
        }
      },
      prepare(input: NotificationInput) {
        const notification: AppNotification = {
          id: nanoid(),
          title: input.title,
          message: input.message,
          variant: input.variant ?? "info",
          read: false,
          createdAt: new Date().toISOString(),
        };
        return { payload: notification };
      },
    },
    notificationRead(
      state,
      action: PayloadAction<AppNotification["id"]>
    ) {
      const target = state.notifications.find((n) => n.id === action.payload);
      if (target) target.read = true;
    },
    notificationRemoved(
      state,
      action: PayloadAction<AppNotification["id"]>
    ) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    notificationsCleared(state) {
      state.notifications = [];
    },
    notificationsMarkedAllAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    notificationsSet(state, action: PayloadAction<AppNotification[]>) {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
    });
  },
});

export const {
  notificationAdded,
  notificationRead,
  notificationRemoved,
  notificationsCleared,
  notificationsMarkedAllAsRead,
  notificationsSet,
} = notificationSlice.actions;

export default notificationSlice.reducer;
