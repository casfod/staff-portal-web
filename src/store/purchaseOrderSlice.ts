import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseOrderType } from "../interfaces";

interface PurchaseOrderState {
  purchaseOrder: PurchaseOrderType | null;
}

const initialState: PurchaseOrderState = {
  purchaseOrder: null,
};

const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    setPurchaseOrder: (state, action: PayloadAction<PurchaseOrderType>) => {
      state.purchaseOrder = action.payload;
    },
    clearPurchaseOrder: (state) => {
      state.purchaseOrder = null;
    },
  },
});

export const { setPurchaseOrder, clearPurchaseOrder } =
  purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
