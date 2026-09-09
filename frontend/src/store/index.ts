import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import uiReducer from "./slices/ui-slice";
import notificationReducer from "./slices/notification-slice";
import { sportsReducer } from "./sports";
import { marketplaceReducer } from "./band";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      notifications: notificationReducer,
      sports: sportsReducer,
      marketplace: marketplaceReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
