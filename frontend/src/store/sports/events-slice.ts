import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { EventType, SportsEvent } from "@/types";
import { eventsService } from "@/services/sports/events.service";

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
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  status: 'idle',
  error: null
};

export const fetchEventsThunk = createAsyncThunk(
  "sports/events/fetchEvents",
  async (groupId?: string) => {
    const response = await eventsService.list(groupId ? { groupId } : undefined);
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.items || []);
  }
);

export const createEventThunk = createAsyncThunk(
  "sports/events/createEvent",
  async (input: NewEventInput) => {
    const response = await eventsService.create(input);
    return response.data as SportsEvent;
  }
);

export const deleteEventThunk = createAsyncThunk(
  "sports/events/deleteEvent",
  async (eventId: string) => {
    await eventsService.delete(eventId);
    return eventId;
  }
);

export const rsvpEventThunk = createAsyncThunk(
  "sports/events/rsvpEvent",
  async ({ eventId, status }: { eventId: string; status: string }) => {
    const response = await eventsService.setAttendance(eventId, { status });
    return { eventId, data: response.data };
  }
);

const eventsSlice = createSlice({
  name: "sports/events",
  initialState,
  reducers: {
    eventRemoved(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEventsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch events';
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      })
      .addCase(deleteEventThunk.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload);
      });
  },
});

export const { eventRemoved } = eventsSlice.actions;
export default eventsSlice.reducer;
