// Redux Slice: purchaseRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurChaseRequestType } from "../interfaces";

// Define the initial state with proper typing
interface PurchaseRequestStateType {
  purchaseRequest: PurChaseRequestType | null;
}

const initialState: PurchaseRequestStateType = {
  purchaseRequest: null,
};

// Create the slice
const purchaseRequestSlice = createSlice({
  name: "purchaseRequest",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setPurChaseRequest: (
      state,
      action: PayloadAction<PurChaseRequestType | null>
    ) => {
      state.purchaseRequest = action.payload;
    },
    // Add a reset action to clear the state
    resetPurchaseRequest: (state) => {
      state.purchaseRequest = null;
    },
  },
});

// Export the actions
export const { setPurChaseRequest, resetPurchaseRequest } =
  purchaseRequestSlice.actions;

// Export the reducer
export default purchaseRequestSlice.reducer;
