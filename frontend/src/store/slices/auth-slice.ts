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
  user: null,
  accessToken: storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
  refreshToken: storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
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
      if (refreshToken) {
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    },
    userUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
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
