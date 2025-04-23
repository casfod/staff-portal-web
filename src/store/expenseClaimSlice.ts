// Redux Slice: aravelRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExpenseClaimType } from "../interfaces";

// Define the initial state with proper typing
interface AravelRequestStateType {
  expenseClaim: ExpenseClaimType | null;
}

const initialState: AravelRequestStateType = {
  expenseClaim: null,
};

// Create the slice
const expenseClaimSlice = createSlice({
  name: "expenseClaim",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setExpenseClaim: (
      state,
      action: PayloadAction<ExpenseClaimType | null>
    ) => {
      state.expenseClaim = action.payload;
    },
    // Add a reset action to clear the state
    resetExpenseClaim: (state) => {
      state.expenseClaim = null;
    },
  },
});

// Export the actions
export const { setExpenseClaim, resetExpenseClaim } = expenseClaimSlice.actions;

// Export the reducer
export default expenseClaimSlice.reducer;
