import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRFQ } from '../interfaces';

interface RFQState {
  rfq: IRFQ | null;
}

const initialState: RFQState = {
  rfq: null,
};

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    setRFQ: (state, action: PayloadAction<IRFQ>) => {
      state.rfq = action.payload;
    },
    clearRFQ: state => {
      state.rfq = null;
    },
    updateRFQ: (state, action: PayloadAction<Partial<IRFQ>>) => {
      if (state.rfq) {
        state.rfq = { ...state.rfq, ...action.payload };
      }
    },
  },
});

export const { setRFQ, clearRFQ, updateRFQ } = rfqSlice.actions;
export default rfqSlice.reducer;
