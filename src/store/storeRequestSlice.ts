import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStoreRequest } from '../interfaces';

interface StoreRequestState {
  storeRequest: IStoreRequest | null;
}

const initialState: StoreRequestState = {
  storeRequest: null,
};

const storeRequestSlice = createSlice({
  name: 'storeRequest',
  initialState,
  reducers: {
    setStoreRequest: (state, action: PayloadAction<IStoreRequest | null>) => {
      state.storeRequest = action.payload;
    },
    resetStoreRequest: state => {
      state.storeRequest = null;
    },
  },
});

export const { setStoreRequest, resetStoreRequest } = storeRequestSlice.actions;
export default storeRequestSlice.reducer;