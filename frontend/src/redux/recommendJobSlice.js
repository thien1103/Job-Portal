// recommendJobSlice.js
import { createSlice } from "@reduxjs/toolkit";

const recommendJobSlice = createSlice({
  name: "recommendJob",
  initialState: {
    recommendedJobs: [],
    loading: false,
    error: null,
  },
  reducers: {
    setRecommendedJobs: (state, action) => {
      state.recommendedJobs = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setRecommendedJobs, setLoading, setError } = recommendJobSlice.actions;
export default recommendJobSlice.reducer;