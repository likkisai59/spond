import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  BandBooking,
  BookingEventType,
  BookingStatus,
} from "@/types";
import { MOCK_BOOKINGS } from "@/band/mocks/band.mock";

export interface MarketplaceFilters {
  query: string;
  genre: string;
  city: string;
  minRating: number;
  priceMax: number;
  setting: string;
  capacityMin: number;
  availability: string;
}

export type MarketplaceSort = "rating" | "price-asc" | "price-desc" | "popular";

export interface BookingDraft {
  performerId: string | null;
  performerName: string | null;
  performerKind: "Artist" | "Band" | "Venue" | null;
  packageId: string | null;
  venueId: string | null;
  date: string;
  startTime: string;
}

export interface NewBookingInput {
  title: string;
  bandName: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  eventType: BookingEventType;
  guestCount: number;
}

export interface MarketplaceState {
  filters: MarketplaceFilters;
  sortBy: MarketplaceSort;
  recentSearches: string[];
  selectedId: string | null;
  bookings: BandBooking[];
  bookingDraft: BookingDraft;
}

const initialState: MarketplaceState = {
  filters: {
    query: "",
    genre: "all",
    city: "all",
    minRating: 0,
    priceMax: 0,
    setting: "all",
    capacityMin: 0,
    availability: "all",
  },
  sortBy: "rating",
  recentSearches: [],
  selectedId: null,
  bookings: MOCK_BOOKINGS,
  bookingDraft: {
    performerId: null,
    performerName: null,
    performerKind: null,
    packageId: null,
    venueId: null,
    date: "",
    startTime: "19:00",
  },
};

const marketplaceSlice = createSlice({
  name: "band/marketplace",
  initialState,
  reducers: {
    querySet(state, action: PayloadAction<string>) {
      state.filters.query = action.payload;
    },
    filterSet(
      state,
      action: PayloadAction<{
        key: keyof MarketplaceFilters;
        value: string | number;
      }>
    ) {
      const { key, value } = action.payload;
      if (key === "query") {
        state.filters.query = String(value);
      } else if (
        key === "minRating" ||
        key === "priceMax" ||
        key === "capacityMin"
      ) {
        state.filters[key] = Number(value);
      } else {
        (state.filters[key] as string) = String(value);
      }
    },
    filtersReset(state) {
      state.filters = { ...initialState.filters };
    },
    sortBySet(state, action: PayloadAction<MarketplaceSort>) {
      state.sortBy = action.payload;
    },
    recentSearchAdded(state, action: PayloadAction<string>) {
      const term = action.payload.trim();
      if (term.length === 0) return;
      state.recentSearches = [
        term,
        ...state.recentSearches.filter((item) => item !== term),
      ].slice(0, 6);
    },
    recentSearchesCleared(state) {
      state.recentSearches = [];
    },
    selectedSet(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    bookingDraftStarted(
      state,
      action: PayloadAction<{
        performerId: string;
        performerName: string;
        performerKind: "Artist" | "Band" | "Venue";
      }>
    ) {
      state.bookingDraft = {
        ...initialState.bookingDraft,
        ...action.payload,
      };
    },
    bookingDraftUpdated(
      state,
      action: PayloadAction<Partial<BookingDraft>>
    ) {
      state.bookingDraft = { ...state.bookingDraft, ...action.payload };
    },
    bookingDraftReset(state) {
      state.bookingDraft = { ...initialState.bookingDraft };
    },
    bookingAdded: {
      reducer(state, action: PayloadAction<BandBooking>) {
        state.bookings.unshift(action.payload);
      },
      prepare(input: NewBookingInput) {
        const now = new Date().toISOString();
        const booking: BandBooking = {
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          status: "Requested",
          timeline: [
            {
              status: "Requested",
              timestamp: now,
              note: `Booking request sent to ${input.bandName}.`,
            },
          ],
          ...input,
        };
        return { payload: booking };
      },
    },
    bookingStatusUpdated(
      state,
      action: PayloadAction<{
        id: string;
        status: BookingStatus;
        note: string;
      }>
    ) {
      const booking = state.bookings.find(
        (b) => b.id === action.payload.id
      );
      if (!booking) return;
      const now = new Date().toISOString();
      booking.status = action.payload.status;
      booking.updatedAt = now;
      booking.timeline.push({
        status: action.payload.status,
        timestamp: now,
        note: action.payload.note,
      });
    },
  },
});

export const {
  querySet,
  filterSet,
  filtersReset,
  sortBySet,
  recentSearchAdded,
  recentSearchesCleared,
  selectedSet,
  bookingDraftStarted,
  bookingDraftUpdated,
  bookingDraftReset,
  bookingAdded,
  bookingStatusUpdated,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
