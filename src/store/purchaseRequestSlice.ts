// Redux Slice: purchaseRequestSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPurchaseRequest } from '../interfaces';

// Define the initial state with proper typing
interface PurchaseRequestStateType {
  purchaseRequest: IPurchaseRequest | null;
}

const initialState: PurchaseRequestStateType = {
  purchaseRequest: null,
};

// Create the slice
const purchaseRequestSlice = createSlice({
  name: 'purchaseRequest',
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setPurchaseRequest: (state, action: PayloadAction<IPurchaseRequest | null>) => {
      state.purchaseRequest = action.payload;
    },
    // Add a reset action to clear the state
    resetPurchaseRequest: state => {
      state.purchaseRequest = null;
    },
  },
});

// Export the actions
export const { setPurchaseRequest, resetPurchaseRequest } = purchaseRequestSlice.actions;

// Export the reducer
export default purchaseRequestSlice.reducer;
