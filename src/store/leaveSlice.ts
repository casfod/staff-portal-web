// src/store/leaveSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILeave } from '../interfaces';

interface LeaveState {
  leave: ILeave | null;
}

const initialState: LeaveState = {
  leave: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLeave: (state, action: PayloadAction<ILeave>) => {
      state.leave = action.payload;
    },
    resetLeave: state => {
      state.leave = null;
    },
  },
});

export const { setLeave, resetLeave } = leaveSlice.actions;
export default leaveSlice.reducer;
