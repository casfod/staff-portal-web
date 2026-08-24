// src/store/appraisalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAppraisal } from '../interfaces';

interface AppraisalState {
  appraisal: IAppraisal | null;
}

const initialState: AppraisalState = {
  appraisal: null,
};

const appraisalSlice = createSlice({
  name: 'appraisal',
  initialState,
  reducers: {
    setAppraisal: (state, action: PayloadAction<IAppraisal>) => {
      state.appraisal = action.payload;
    },
    clearAppraisal: state => {
      state.appraisal = null;
    },
  },
});

export const { setAppraisal, clearAppraisal } = appraisalSlice.actions;
export default appraisalSlice.reducer;
