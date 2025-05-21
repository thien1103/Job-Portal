import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllJobs = createAsyncThunk(
  "searchJob/fetchAllJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Xử lý logic location
      const processedParams = {
        ...params,
        ...(params.location === 'Others' && { 
          location: 'custom',
          excludeLocations: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'] 
        })
      };

      const query = new URLSearchParams(processedParams).toString();
      const res = await axios.get(`/api/jobs?${query}`, { 
        withCredentials: true 
      });
      
      // Xử lý thêm location type
      const jobsWithLocationType = res.data.data.map(job => ({
        ...job,
        locationType: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].includes(job.location) 
          ? job.location 
          : 'Others'
      }));
      
      return jobsWithLocationType;
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