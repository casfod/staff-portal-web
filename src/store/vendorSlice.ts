// Redux Slice: aravelRequestSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IVendor } from '../interfaces';

// Define the initial state with proper typing
interface VendorStateType {
  vendor: IVendor | null;
}

const initialState: VendorStateType = {
  vendor: null,
};

// Create the slice
const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setVendor: (state, action: PayloadAction<IVendor | null>) => {
      state.vendor = action.payload;
    },
    // Add a reset action to clear the state
    resetVendor: state => {
      state.vendor = null;
    },
  },
});

// Export the actions
export const { setVendor, resetVendor } = vendorSlice.actions;

// Export the reducer
export default vendorSlice.reducer;
