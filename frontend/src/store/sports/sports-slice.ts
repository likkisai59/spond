import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ActivityItem } from "@/types";
import { MOCK_ACTIVITY } from "@/sports/mocks/activity.mock";

export interface SportsFeedState {
  activity: ActivityItem[];
}

const initialState: SportsFeedState = { activity: MOCK_ACTIVITY };

const sportsSlice = createSlice({
  name: "sports",
  initialState,
  reducers: {
    activityAdded(state, action: PayloadAction<ActivityItem>) {
      state.activity.unshift(action.payload);
    },
  },
});

export const { activityAdded } = sportsSlice.actions;
export default sportsSlice.reducer;
