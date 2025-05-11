import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    allJobs: [],
    allRecruiterJobs: [],
    singleJob: null,
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: "",
    loading: false,
  },
  reducers: {
    setAllJobs: (state, action) => {
      state.allJobs = action.payload;
    },
    setSingleJob: (state, action) => {
      state.singleJob = action.payload;
    },
    setAllRecruiterJobs: (state, action) => {
      state.allRecruiterJobs = action.payload;
    },
    setSearchJobByText: (state, action) => {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs: (state, action) => {
      // Only update if payload is a non-empty array
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        state.allAppliedJobs = action.payload;
      }
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllRecruiterJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setLoading,
} = jobSlice.actions;

export default jobSlice.reducer;