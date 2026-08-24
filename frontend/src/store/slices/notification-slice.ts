import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AppNotification, NotificationVariant } from "@/types";
// Removed MOCK_NOTIFICATIONS import

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
    notificationsSet(state, action: PayloadAction<AppNotification[]>) {
      state.notifications = action.payload;
    },
  },
});

export const {
  notificationAdded,
  notificationRead,
  notificationRemoved,
  notificationsCleared,
  notificationsSet,
} = notificationSlice.actions;

export default notificationSlice.reducer;
