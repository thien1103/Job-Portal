import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    allJobs: [],
    allRecruiterJobs: [],
    singleJob: null,
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: {},
    loading: false,
    savedJobIds: [], // Added for saved job IDs
  },
  reducers: {
    setAllJobs: (state, action) => {
      state.allJobs = Array.isArray(action.payload) ? action.payload : [];
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
    setSavedJobIds: (state, action) => {
      state.savedJobIds = Array.isArray(action.payload) ? action.payload : [];
    },
    resetJobState: (state) => {
      state.allJobs = [];
      state.allRecruiterJobs = [];
      state.singleJob = null;
      state.searchJobByText = "";
      state.allAppliedJobs = [];
      state.searchedQuery = {};
      state.loading = false;
      state.savedJobIds = [];
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
  setSavedJobIds,
  resetJobState,
} = jobSlice.actions;

export default jobSlice.reducer;