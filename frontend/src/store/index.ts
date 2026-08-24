import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import uiReducer from "./slices/ui-slice";
import notificationReducer from "./slices/notification-slice";
import { sportsReducer } from "./sports";
import { bandReducer } from "./band";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    sports: sportsReducer,
    band: bandReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
