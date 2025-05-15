import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk để fetch danh sách công việc (có thể kèm theo query params search/filter)
export const fetchAllJobs = createAsyncThunk(
  "searchJob/fetchAllJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`/api/jobs?${query}`, { withCredentials: true });
      return res.data.data; // Use res.data.data instead of res.data.jobs
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const searchJobSlice = createSlice({
  name: "searchJob",
  initialState: {
    jobs: [],
    loading: false,
    error: null,
    searchedQuery: {}, // Add searchedQuery to the state
  },
  reducers: {
    clearJobs: (state) => {
      state.jobs = [];
      state.loading = false;
      state.error = null;
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload || []; // Ensure jobs is always an array
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJobs, setSearchedQuery } = searchJobSlice.actions;
export default searchJobSlice.reducer;