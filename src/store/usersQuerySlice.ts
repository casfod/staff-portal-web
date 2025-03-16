// userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import genericQuerySlice, { QueryState } from "./genericQuerySlice";

interface UserState extends QueryState {
  // Add user-specific state here if needed
}

const initialState: UserState = {
  ...genericQuerySlice.prototype(),
  // Add user-specific initial state here
};

const userSlice = createSlice({
  name: "usersQuery",
  initialState,
  reducers: {
    ...genericQuerySlice.prototype,
    // Add user-specific reducers here
  },
});

export const { setSearchTerm, setSort, setPage, setLimit } = userSlice.actions;
export default userSlice.reducer;
