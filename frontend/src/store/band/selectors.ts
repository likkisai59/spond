import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { BandBooking } from "@/types";
import type { MarketplaceFilters, MarketplaceSort, BookingDraft } from "./marketplace-slice";

export const selectBandState = (state: RootState) => state.band.marketplace;

export const selectMarketplaceFilters = (state: RootState): MarketplaceFilters =>
  state.band.marketplace.filters;

export const selectMarketplaceSort = (state: RootState): MarketplaceSort =>
  state.band.marketplace.sortBy;

export const selectRecentSearches = (state: RootState): string[] =>
  state.band.marketplace.recentSearches;

export const selectBookingDraft = (state: RootState): BookingDraft =>
  state.band.marketplace.bookingDraft;

export const selectBandBookings = (state: RootState): BandBooking[] =>
  state.band.marketplace.bookings;

export const selectBookingById = (
  state: RootState,
  bookingId: string
): BandBooking | undefined =>
  state.band.marketplace.bookings.find((b) => b.id === bookingId);

export const selectActiveBookings = createSelector(
  [selectBandBookings],
  (bookings) =>
    bookings.filter(
      (b) => b.status === "Requested" || b.status === "Confirmed"
    )
);

export const selectUpcomingPerformances = createSelector(
  [selectBandBookings],
  (bookings) =>
    bookings
      .filter((b) => b.status === "Confirmed")
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
);

export const selectRecentBookings = createSelector(
  [selectBandBookings],
  (bookings) =>
    [...bookings].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    )
);
