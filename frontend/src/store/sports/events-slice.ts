import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { EventType, SportsEvent } from "@/types";
import { MOCK_EVENTS } from "@/sports/mocks/events.mock";

export interface NewEventInput {
  groupId: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  notifyMembers: boolean;
}

export interface EventsState {
  events: SportsEvent[];
}

const initialState: EventsState = { events: MOCK_EVENTS };

const eventsSlice = createSlice({
  name: "sports/events",
  initialState,
  reducers: {
    eventAdded: {
      reducer(state, action: PayloadAction<SportsEvent>) {
        state.events.unshift(action.payload);
      },
      prepare(input: NewEventInput) {
        const now = new Date().toISOString();
        const event: SportsEvent = {
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          status: "Upcoming",
          attendance: { going: 0, maybe: 0, notResponded: 0 },
          ...input,
        };
        return { payload: event };
      },
    },
    eventRemoved(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
  },
});

export const { eventAdded, eventRemoved } = eventsSlice.actions;
export default eventsSlice.reducer;
