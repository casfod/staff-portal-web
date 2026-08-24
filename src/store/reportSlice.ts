// ============================================================
// reportSlice.ts  (src/store/reportSlice.ts)
// Mirrors advanceRequestSlice — add to your Redux store
// ============================================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IReport } from '../interfaces';

interface ReportState {
  report: IReport | null;
}

const initialState: ReportState = {
  report: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setReport: (state, action: PayloadAction<IReport>) => {
      state.report = action.payload;
    },
    clearReport: state => {
      state.report = null;
    },
  },
});

export const { setReport, clearReport } = reportSlice.actions;
export default reportSlice.reducer;
