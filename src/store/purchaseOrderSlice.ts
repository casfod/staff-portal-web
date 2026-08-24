import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPurchaseOrder } from '../interfaces';

interface PurchaseOrderState {
  purchaseOrder: IPurchaseOrder | null;
}

const initialState: PurchaseOrderState = {
  purchaseOrder: null,
};

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState,
  reducers: {
    setPurchaseOrder: (state, action: PayloadAction<IPurchaseOrder>) => {
      state.purchaseOrder = action.payload;
    },
    clearPurchaseOrder: state => {
      state.purchaseOrder = null;
    },
  },
});

export const { setPurchaseOrder, clearPurchaseOrder } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
