// Redux Slice: purchaseRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "../interfaces";

// Define the initial state with proper typing
interface projectStateType {
  project: Project | null;
}

const initialState: projectStateType = {
  project: null,
};

// Create the slice
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setProject: (state, action: PayloadAction<Project | null>) => {
      state.project = action.payload;
    },
    // Add a reset action to clear the state
    resetProject: (state) => {
      state.project = null;
    },
  },
});

// Export the actions
export const { setProject, resetProject } = projectSlice.actions;

// Export the reducer
export default projectSlice.reducer;
