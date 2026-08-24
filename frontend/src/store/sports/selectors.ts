import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
  Conversation,
  GroupMember,
  PaymentRequest,
  SportsEvent,
  SportsFile,
  SportsGroup,
  SportsPoll,
  VenueBooking,
} from "@/types";

export const selectSportsState = (state: RootState) => state.sports;

export const selectAllGroups = (state: RootState): SportsGroup[] =>
  state.sports.groups.groups;

export const selectGroupById = (
  state: RootState,
  groupId: string
): SportsGroup | undefined =>
  state.sports.groups.groups.find((g) => g.id === groupId);

export const selectAllEvents = (state: RootState): SportsEvent[] =>
  state.sports.events.events;

export const selectEventById = (
  state: RootState,
  eventId: string
): SportsEvent | undefined =>
  state.sports.events.events.find((e) => e.id === eventId);

export const selectUpcomingEvents = createSelector(
  [selectAllEvents],
  (events) =>
    events
      .filter((e) => e.status === "Upcoming" || e.status === "Ongoing")
      .sort((a, b) => a.date.localeCompare(b.date))
);

export const selectPastEvents = createSelector(
  [selectAllEvents],
  (events) =>
    events
      .filter((e) => e.status === "Completed" || e.status === "Cancelled")
      .sort((a, b) => b.date.localeCompare(a.date))
);

export const selectAllPolls = (state: RootState): SportsPoll[] =>
  state.sports.polls.polls;

export const selectPollById = (
  state: RootState,
  pollId: string
): SportsPoll | undefined =>
  state.sports.polls.polls.find((p) => p.id === pollId);

export const selectActivePolls = createSelector(
  [selectAllPolls],
  (polls) => polls.filter((p) => p.status === "Active")
);

export const selectClosedPolls = createSelector(
  [selectAllPolls],
  (polls) => polls.filter((p) => p.status === "Closed")
);

export const selectAllPayments = (state: RootState): PaymentRequest[] =>
  state.sports.payments.payments;

export const selectPaymentById = (
  state: RootState,
  paymentId: string
): PaymentRequest | undefined =>
  state.sports.payments.payments.find((p) => p.id === paymentId);

export const selectPendingPayments = createSelector(
  [selectAllPayments],
  (payments) => payments.filter((p) => p.status !== "Paid")
);

export const selectAllConversations = createSelector(
  [(state: RootState) => state.sports.messages.conversations],
  (conversations): Conversation[] =>
    [...conversations].sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt)
    )
);

export const selectConversationById = (
  state: RootState,
  conversationId: string
): Conversation | undefined =>
  state.sports.messages.conversations.find((c) => c.id === conversationId);

export const selectUnreadMessagesCount = (state: RootState): number =>
  state.sports.messages.conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );

export const selectAllFiles = (state: RootState): SportsFile[] =>
  state.sports.files.files;

export const selectFileById = (
  state: RootState,
  fileId: string
): SportsFile | undefined =>
  state.sports.files.files.find((f) => f.id === fileId);

export const selectRecentFiles = createSelector(
  [selectAllFiles],
  (files) =>
    [...files]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
);

export const selectMemberById = (
  state: RootState,
  memberId: string
): GroupMember | undefined =>
  state.sports.groups.groups
    .flatMap((group) => group.members)
    .find((member) => member.id === memberId);

export const selectRecentActivity = (state: RootState) =>
  state.sports.feed.activity.slice(0, 8);

export const selectAllBookings = (state: RootState): VenueBooking[] =>
  state.sports.bookings.bookings;

export const selectBookingById = (
  state: RootState,
  bookingId: string
): VenueBooking | undefined =>
  state.sports.bookings.bookings.find((b) => b.id === bookingId);

export const selectUpcomingBookings = createSelector(
  [selectAllBookings],
  (bookings) => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings
      .filter(
        (b) =>
          (b.status === "Confirmed" || b.status === "Pending") &&
          b.eventDate >= today
      )
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }
);

export const selectPastBookings = createSelector(
  [selectAllBookings],
  (bookings) => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings
      .filter(
        (b) =>
          !(
            (b.status === "Confirmed" || b.status === "Pending") &&
            b.eventDate >= today
          )
      )
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  }
);

export const selectSportsStats = createSelector(
  [
    selectAllGroups,
    selectUpcomingEvents,
    selectPendingPayments,
    selectUnreadMessagesCount,
  ],
  (groups, upcomingEvents, pendingPayments, unreadMessages) => {
    const members = groups.reduce((total, g) => total + g.memberCount, 0);
    return {
      groups: groups.length,
      events: upcomingEvents.length,
      members,
      paymentsDue: pendingPayments.length,
      unreadMessages,
    };
  }
);
