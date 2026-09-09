import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AsyncState, AuthSession, User } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AsyncState;
  error: string | null;
}

const initialState: AuthState = {
  user: typeof window !== "undefined" ? storage.get<User>(STORAGE_KEYS.USER) : null,
  accessToken: typeof window !== "undefined" ? storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN) : null,
  refreshToken: typeof window !== "undefined" ? storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN) : null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    credentialsReceived(state, action: PayloadAction<AuthSession>) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? null;
      state.status = "succeeded";
      state.error = null;
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      storage.set(STORAGE_KEYS.USER, user);
      if (refreshToken) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    },
    userUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
      storage.set(STORAGE_KEYS.USER, action.payload);
    },
    authStatusChanged(state, action: PayloadAction<AsyncState>) {
      state.status = action.payload;
    },
    authFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    authReset(state) {
      state.status = "idle";
      state.error = null;
    },
    loggedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    },
  },
});

export const {
  credentialsReceived,
  userUpdated,
  authStatusChanged,
  authFailed,
  authReset,
  loggedOut,
} = authSlice.actions;

export default authSlice.reducer;
