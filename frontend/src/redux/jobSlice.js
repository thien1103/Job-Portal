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
        loading: false, // Added loading state
        error: null,   // Added error state
    },
    reducers: {
        // actions
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
            state.loading = false;
            state.error = null;
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
            state.loading = false;
            state.error = null;
        },
        setAllRecruiterJobs: (state, action) => {
            state.allRecruiterJobs = action.payload;
            state.loading = false;
            state.error = null;
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
            state.loading = false;
            state.error = null;
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
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

export const {
    setAllJobs,
    setSingleJob,
    setAllRecruiterJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setLoading, // Added export
    setError,   // Added export
} = jobSlice.actions;

export default jobSlice.reducer;