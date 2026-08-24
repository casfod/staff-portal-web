// store/goodsReceivedSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGoodsReceived } from '../interfaces';

interface GoodsReceivedState {
  goodsReceived: IGoodsReceived | null;
}

const initialState: GoodsReceivedState = {
  goodsReceived: null,
};

const goodsReceivedSlice = createSlice({
  name: 'goodsReceived',
  initialState,
  reducers: {
    setGoodsReceived: (state, action: PayloadAction<IGoodsReceived>) => {
      state.goodsReceived = action.payload;
    },
    clearGoodsReceived: state => {
      state.goodsReceived = null;
    },
  },
});

export const { setGoodsReceived, clearGoodsReceived } = goodsReceivedSlice.actions;
export default goodsReceivedSlice.reducer;
