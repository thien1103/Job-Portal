import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name: "company",
    initialState: {
        singleCompany: null,
        companies: [],
        searchCompanyByText: "",
        loading: false, // Added loading state
    },
    reducers: {
        // actions
        setSingleCompany: (state, action) => {
            state.singleCompany = action.payload;
        },
        setCompanies: (state, action) => {
            state.companies = action.payload;
        },
        setSearchCompanyByText: (state, action) => {
            state.searchCompanyByText = action.payload;
        },
        setLoading: (state, action) => { // Added setLoading action
            state.loading = action.payload;
        },
    },
});
export const { setSingleCompany, setCompanies, setSearchCompanyByText, setLoading } = companySlice.actions; // Added setLoading to exports
export default companySlice.reducer;