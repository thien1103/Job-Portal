import { createSlice } from "@reduxjs/toolkit";

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    adminUser: null,
    loading: false,
  },
  reducers: {
    setAdminUser: (state, action) => {
      state.adminUser = action.payload;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setAdminUser, setAdminLoading } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
