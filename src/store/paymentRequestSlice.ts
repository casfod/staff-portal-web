// Redux Slice: paymentRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentRequestType } from "../interfaces";

// Define the initial state with proper typing
interface PaymentRequestStateType {
  paymentRequest: PaymentRequestType | null;
}

const initialState: PaymentRequestStateType = {
  paymentRequest: null,
};

// Create the slice
const paymentRequestSlice = createSlice({
  name: "paymentRequest",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setPaymentRequest: (
      state,
      action: PayloadAction<PaymentRequestType | null>
    ) => {
      state.paymentRequest = action.payload;
    },
    // Add a reset action to clear the state
    resetPaymentRequest: (state) => {
      state.paymentRequest = null;
    },
  },
});

// Export the actions
export const { setPaymentRequest, resetPaymentRequest } =
  paymentRequestSlice.actions;

// Export the reducer
export default paymentRequestSlice.reducer;
