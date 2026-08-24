import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { VenueBooking, VenueBookingStatus } from "@/types";
import { MOCK_BOOKINGS } from "@/sports/mocks/bookings.mock";

export interface NewBookingInput {
  venueId: string;
  venueName: string;
  eventDate: string;
  slotId: string;
  slotLabel: string;
  groupName: string;
  price: number;
}

export interface BookingsState {
  bookings: VenueBooking[];
}

const initialState: BookingsState = { bookings: MOCK_BOOKINGS };

const bookingsSlice = createSlice({
  name: "sports/bookings",
  initialState,
  reducers: {
    bookingCreated: {
      reducer(state, action: PayloadAction<VenueBooking>) {
        state.bookings.unshift(action.payload);
      },
      prepare(input: NewBookingInput) {
        const now = new Date().toISOString();
        const booking: VenueBooking = {
          id: `vb-${nanoid(8)}`,
          createdAt: now,
          updatedAt: now,
          status: "Confirmed",
          ...input,
        };
        return { payload: booking };
      },
    },
    bookingCancelled(state, action: PayloadAction<string>) {
      const booking = state.bookings.find((b) => b.id === action.payload);
      if (!booking) return;
      booking.status = "Cancelled";
      booking.updatedAt = new Date().toISOString();
    },
    bookingStatusSet(
      state,
      action: PayloadAction<{ id: string; status: VenueBookingStatus }>
    ) {
      const booking = state.bookings.find((b) => b.id === action.payload.id);
      if (!booking) return;
      booking.status = action.payload.status;
      booking.updatedAt = new Date().toISOString();
    },
  },
});

export const { bookingCreated, bookingCancelled, bookingStatusSet } =
  bookingsSlice.actions;
export default bookingsSlice.reducer;
