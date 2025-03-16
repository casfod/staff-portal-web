import { configureStore } from "@reduxjs/toolkit";

import modalReducer from "./modalSlice.ts";
import purchaseRequestReducer from "./purchaseRequestSlice.ts";
import genericQuerySliceReducer from "./genericQuerySlice.ts";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    purchaseRequest: purchaseRequestReducer,
    genericQuerySlice: genericQuerySliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
