import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";

export type ThemePreference = "light" | "dark" | "system";

export interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: storage.get<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false,
  mobileNavOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    sidebarCollapseSet(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    mobileNavOpened(state) {
      state.mobileNavOpen = true;
    },
    mobileNavClosed(state) {
      state.mobileNavOpen = false;
    },
    mobileNavToggled(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
  },
});

export const {
  sidebarToggled,
  sidebarCollapseSet,
  mobileNavOpened,
  mobileNavClosed,
  mobileNavToggled,
} = uiSlice.actions;

export default uiSlice.reducer;
