// genericQuerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QueryState {
  searchTerm: string;
  sort: string;
  page: number;
  limit: number;
}

const initialState: QueryState = {
  searchTerm: "",
  sort: "",
  page: 1,
  limit: 10,
};

const genericQuerySlice = createSlice({
  name: "genericQuery",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },

    resetQuery: (state) => {
      state.searchTerm = "";
      state.sort = "";
      state.page = 1;
      state.limit = 10;
    },
  },
});

export const { setSearchTerm, setSort, setPage, setLimit, resetQuery } =
  genericQuerySlice.actions;

export default genericQuerySlice.reducer;
