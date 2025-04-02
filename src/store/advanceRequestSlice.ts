// Redux Slice: advanceRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdvanceRequestType } from "../interfaces";

// Define the initial state with proper typing
interface AdvanceRequestStateType {
  advanceRequest: AdvanceRequestType | null;
}

const initialState: AdvanceRequestStateType = {
  advanceRequest: null,
};

// Create the slice
const advanceRequestSlice = createSlice({
  name: "advanceRequest",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setAdvanceRequest: (
      state,
      action: PayloadAction<AdvanceRequestType | null>
    ) => {
      state.advanceRequest = action.payload;
    },
    // Add a reset action to clear the state
    resetAdvanceRequest: (state) => {
      state.advanceRequest = null;
    },
  },
});

// Export the actions
export const { setAdvanceRequest, resetAdvanceRequest } =
  advanceRequestSlice.actions;

// Export the reducer
export default advanceRequestSlice.reducer;
