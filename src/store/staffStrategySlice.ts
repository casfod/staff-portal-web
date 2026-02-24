import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StaffStrategyType } from "../interfaces";

interface StaffStrategyState {
  staffStrategy: StaffStrategyType | null;
}

const initialState: StaffStrategyState = {
  staffStrategy: null,
};

const staffStrategySlice = createSlice({
  name: "staffStrategy",
  initialState,
  reducers: {
    setStaffStrategy: (state, action: PayloadAction<StaffStrategyType>) => {
      state.staffStrategy = action.payload;
    },
    clearStaffStrategy: (state) => {
      state.staffStrategy = null;
    },
  },
});

export const { setStaffStrategy, clearStaffStrategy } =
  staffStrategySlice.actions;
export default staffStrategySlice.reducer;
