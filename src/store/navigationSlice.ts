// Redux Slice: navigationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationStateType {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
}

const initialState: NavigationStateType = {
  isMobileOpen: false,
  isDesktopOpen: true,
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setIsMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileOpen = action.payload;
    },
    setIsDesktopOpen: (state, action: PayloadAction<boolean>) => {
      state.isDesktopOpen = action.payload;
    },
    toggleDesktop: (state) => {
      state.isDesktopOpen = !state.isDesktopOpen;
    },
    resetNavigation: () => initialState,
  },
});

export const {
  setIsMobileOpen,
  setIsDesktopOpen,
  toggleDesktop,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;
