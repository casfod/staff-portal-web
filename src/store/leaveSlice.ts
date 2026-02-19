// src/store/leaveSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveType } from "../interfaces";

interface LeaveState {
  leave: LeaveType | null;
}

const initialState: LeaveState = {
  leave: null,
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    setLeave: (state, action: PayloadAction<LeaveType>) => {
      state.leave = action.payload;
    },
    resetLeave: (state) => {
      state.leave = null;
    },
  },
});

export const { setLeave, resetLeave } = leaveSlice.actions;
export default leaveSlice.reducer;
