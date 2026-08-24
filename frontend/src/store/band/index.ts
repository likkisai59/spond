import { combineReducers } from "@reduxjs/toolkit";
import marketplaceReducer from "./marketplace-slice";

export const bandReducer = combineReducers({
  marketplace: marketplaceReducer,
});

export type BandState = ReturnType<typeof bandReducer>;
