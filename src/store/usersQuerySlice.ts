// userSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import genericQuerySlice, { GenericQueryState } from './genericQuerySlice';

const initialState: GenericQueryState = {
  ...genericQuerySlice.prototype(),
  // Add user-specific initial state here
};

const userSlice = createSlice({
  name: 'usersQuery',
  initialState,
  reducers: {
    ...genericQuerySlice.prototype,
    // Add user-specific reducers here
  },
});

export const { setSearchTerm, setSort, setPage, setLimit } = userSlice.actions;
export default userSlice.reducer;
