import { configureStore } from "@reduxjs/toolkit";

import modalReducer from "./modalSlice.ts"; // Import the modal slice

import purchaseRequestReducer from "./purchaseRequestSlice.ts"; // Import the modal slice

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    purchaseRequest: purchaseRequestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
