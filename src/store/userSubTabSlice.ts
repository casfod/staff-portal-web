// src/store/userSubTabSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Separate types for view and edit modes
export type ViewTabType = 'status' | 'details';
export type EditTabType = 'toggle' | 'info';

interface TabState {
  viewTab: ViewTabType;
  editTab: EditTabType;
}

const initialState: TabState = {
  viewTab: 'status',
  editTab: 'toggle',
};

const userSubTabSlice = createSlice({
  name: 'userTab',
  initialState,
  reducers: {
    // View mode tab setters
    setViewTab: (state, action: PayloadAction<ViewTabType>) => {
      state.viewTab = action.payload;
    },
    resetViewTab: state => {
      state.viewTab = 'status';
    },

    // Edit mode tab setters
    setEditTab: (state, action: PayloadAction<EditTabType>) => {
      state.editTab = action.payload;
    },
    resetEditTab: state => {
      state.editTab = 'toggle';
    },

    // Reset both tabs
    resetAllTabs: state => {
      state.viewTab = 'status';
      state.editTab = 'toggle';
    },
  },
});

export const { setViewTab, resetViewTab, setEditTab, resetEditTab, resetAllTabs } =
  userSubTabSlice.actions;

export default userSubTabSlice.reducer;
