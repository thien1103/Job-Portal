import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: "application",
    initialState: {
        applicants: null,
    },
    reducers: {
        setAllApplicants: (state, action) => {
            state.applicants = action.payload;
        },
        resetApplicationState: (state) => {
            state.applicants = null;
        },
    },
});

export const { setAllApplicants, resetApplicationState } = applicationSlice.actions;
export default applicationSlice.reducer;