import { combineReducers } from "@reduxjs/toolkit";
import sportsFeedReducer from "./sports-slice";
import groupsReducer from "./groups-slice";
import eventsReducer from "./events-slice";
import pollsReducer from "./polls-slice";
import paymentsReducer from "./payments-slice";
import messagesReducer from "./messages-slice";
import filesReducer from "./files-slice";
import bookingsReducer from "./bookings-slice";

export const sportsReducer = combineReducers({
  feed: sportsFeedReducer,
  groups: groupsReducer,
  events: eventsReducer,
  polls: pollsReducer,
  payments: paymentsReducer,
  messages: messagesReducer,
  files: filesReducer,
  bookings: bookingsReducer,
});

export type SportsState = ReturnType<typeof sportsReducer>;
