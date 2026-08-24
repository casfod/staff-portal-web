// store/genericQuerySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFilterState } from '@/interfaces';

export interface GenericQueryState {
  searchTerm: string;
  sort: string;
  page: number;
  limit: number;
  filters: IFilterState;
}

const initialState: GenericQueryState = {
  searchTerm: '',
  sort: '-createdAt',
  page: 1,
  limit: 10,
  filters: {},
};

const genericQuerySlice = createSlice({
  name: 'genericQuerySlice',
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
    setFilters: (state, action: PayloadAction<IFilterState>) => {
      state.filters = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<{ key: string; value: string | string[] | Date | null }>
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: state => {
      state.filters = {};
    },
    resetQuery: state => {
      state.searchTerm = '';
      state.sort = '-createdAt';
      state.page = 1;
      state.limit = 10;
      state.filters = {};
    },
  },
});

export const {
  setSearchTerm,
  setSort,
  setPage,
  setLimit,
  setFilters,
  setFilter,
  clearFilters,
  resetQuery,
} = genericQuerySlice.actions;
//
export default genericQuerySlice.reducer;
