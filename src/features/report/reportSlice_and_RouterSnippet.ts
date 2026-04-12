// ============================================================
// reportSlice.ts  (src/store/reportSlice.ts)
// Mirrors advanceRequestSlice — add to your Redux store
// ============================================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReportType } from "../interfaces";

interface ReportState {
  report: ReportType | null;
}

const initialState: ReportState = {
  report: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setReport: (state, action: PayloadAction<ReportType>) => {
      state.report = action.payload;
    },
    clearReport: (state) => {
      state.report = null;
    },
  },
});

export const { setReport, clearReport } = reportSlice.actions;
export default reportSlice.reducer;


// ============================================================
// Router.tsx additions
// Add these imports at the top of your existing Router.tsx:
// ============================================================
//
// import { Reports } from "./pages/Reports.tsx";
// import Reporting from "./pages/Reporting.tsx";          // parent shell (see below)
// import AllReports from "./features/report/AllReports.tsx";
// import Report from "./features/report/Report.tsx";
// import CreateReport from "./features/report/CreateReport.tsx";
// import { EditReport } from "./features/report/EditReport.tsx";
//
// Then add this route block inside the children[] array of the
// root AuthGuard/Layout element, alongside "advance-requests":
//
// {
//   path: "reporting",
//   element: <AnimatedRoute key="reporting" element={<Reports />} />,
//   children: [
//     { index: true, element: <Navigate to="all-reports" /> },
//     {
//       path: "all-reports",
//       element: <AnimatedRoute key="all-reports" element={<AllReports />} />,
//     },
//     {
//       path: "create-report",
//       element: <AnimatedRoute key="create-report" element={<CreateReport />} />,
//     },
//     {
//       path: "report/:requestId",
//       element: <AnimatedRoute key="report/:requestId" element={<Report />} />,
//     },
//     {
//       path: "edit-report/:requestId",
//       element: <AnimatedRoute key="edit-report/:requestId" element={<EditReport />} />,
//     },
//   ],
// },
//
// Also register the reducer in your store.ts:
//   import reportReducer from "./reportSlice";
//   report: reportReducer,
