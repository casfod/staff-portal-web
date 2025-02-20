// Redux Slice: modalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openName: "",
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.openName = action.payload;
    },
    closeModal: (state) => {
      state.openName = "";
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
