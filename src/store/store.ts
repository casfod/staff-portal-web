import { configureStore } from "@reduxjs/toolkit";

import modalReducer from "./modalSlice.ts";
import projectReducer from "./projectSlice.ts";
import conceptNoteReducer from "./conceptNoteSlice.ts";
import purchaseRequestReducer from "./purchaseRequestSlice.ts";
import paymentRequestReducer from "./paymentRequestSlice.ts";
import genericQuerySliceReducer from "./genericQuerySlice.ts";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    paymentRequest: paymentRequestReducer,
    purchaseRequest: purchaseRequestReducer,
    project: projectReducer,
    conceptNote: conceptNoteReducer,
    genericQuerySlice: genericQuerySliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
