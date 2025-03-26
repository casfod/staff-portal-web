// Redux Slice: purchaseRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConceptNote } from "../interfaces";

// Define the initial state with proper typing
interface projectStateType {
  conceptNote: ConceptNote | null;
}

const initialState: projectStateType = {
  conceptNote: null,
};

// Create the slice
const conceptNoteSlice = createSlice({
  name: "conceptNote",
  initialState,
  reducers: {
    // Use PayloadAction to enforce type safety for the action payload
    setConceptNote: (state, action: PayloadAction<ConceptNote | null>) => {
      state.conceptNote = action.payload;
    },
    // Add a reset action to clear the state
    resetConceptNote: (state) => {
      state.conceptNote = null;
    },
  },
});

// Export the actions
export const { setConceptNote, resetConceptNote } = conceptNoteSlice.actions;

// Export the reducer
export default conceptNoteSlice.reducer;
