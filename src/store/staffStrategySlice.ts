import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStaffStrategy } from '../interfaces';

interface StaffStrategyState {
  staffStrategy: IStaffStrategy | null;
}

const initialState: StaffStrategyState = {
  staffStrategy: null,
};

const staffStrategySlice = createSlice({
  name: 'staffStrategy',
  initialState,
  reducers: {
    setStaffStrategy: (state, action: PayloadAction<IStaffStrategy>) => {
      state.staffStrategy = action.payload;
    },
    clearStaffStrategy: state => {
      state.staffStrategy = null;
    },
  },
});

export const { setStaffStrategy, clearStaffStrategy } = staffStrategySlice.actions;
export default staffStrategySlice.reducer;
