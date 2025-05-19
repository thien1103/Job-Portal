import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name: "company",
    initialState: {
        singleCompany: null,
        companies: [],
        searchCompanyByText: "",
        loading: false,
    },
    reducers: {
        setSingleCompany: (state, action) => {
            state.singleCompany = action.payload;
        },
        setCompanies: (state, action) => {
            state.companies = action.payload;
        },
        setSearchCompanyByText: (state, action) => {
            state.searchCompanyByText = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        resetCompanyState: (state) => {
            state.singleCompany = null;
            state.companies = [];
            state.searchCompanyByText = "";
            state.loading = false;
        },
    },
});

export const { setSingleCompany, setCompanies, setSearchCompanyByText, setLoading, resetCompanyState } = companySlice.actions;
export default companySlice.reducer;