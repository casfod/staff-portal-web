// store/goodsReceivedSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GoodsReceivedType } from "../interfaces";

interface GoodsReceivedState {
  goodsReceived: GoodsReceivedType | null;
}

const initialState: GoodsReceivedState = {
  goodsReceived: null,
};

const goodsReceivedSlice = createSlice({
  name: "goodsReceived",
  initialState,
  reducers: {
    setGoodsReceived: (state, action: PayloadAction<GoodsReceivedType>) => {
      state.goodsReceived = action.payload;
    },
    clearGoodsReceived: (state) => {
      state.goodsReceived = null;
    },
  },
});

export const { setGoodsReceived, clearGoodsReceived } =
  goodsReceivedSlice.actions;
export default goodsReceivedSlice.reducer;
