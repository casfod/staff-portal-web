// store/paymentVoucherSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPaymentVoucher } from '../interfaces';

interface PaymentVoucherState {
  paymentVoucher: IPaymentVoucher | null;
}

const initialState: PaymentVoucherState = {
  paymentVoucher: null,
};

const paymentVoucherSlice = createSlice({
  name: 'paymentVoucher',
  initialState,
  reducers: {
    setPaymentVoucher: (state, action: PayloadAction<IPaymentVoucher>) => {
      state.paymentVoucher = action.payload;
    },
    resetPaymentVoucher: state => {
      state.paymentVoucher = null;
    },
  },
});

export const { setPaymentVoucher, resetPaymentVoucher } = paymentVoucherSlice.actions;
export default paymentVoucherSlice.reducer;
