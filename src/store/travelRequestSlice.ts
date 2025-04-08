// Redux Slice: aravelRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TravelRequestType } from "../interfaces";

// Define the initial state with proper typing
interface AravelRequestStateType {
  travelRequest: TravelRequestType | null;
}

const initialState: AravelRequestStateType = {
  travelRequest: null,
};

// Create the slice
const travelRequestSlice = createSlice({
  name: "travelRequest",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setTravelRequest: (
      state,
      action: PayloadAction<TravelRequestType | null>
    ) => {
      state.travelRequest = action.payload;
    },
    // Add a reset action to clear the state
    resetTravelRequest: (state) => {
      state.travelRequest = null;
    },
  },
});

// Export the actions
export const { setTravelRequest, resetTravelRequest } =
  travelRequestSlice.actions;

// Export the reducer
export default travelRequestSlice.reducer;
