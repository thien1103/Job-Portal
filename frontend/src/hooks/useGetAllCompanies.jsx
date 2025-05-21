import { setCompanies } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllCompanies = () => {
  const dispatch = useDispatch();
  console.log("useGetAllCompanies hook called");

  useEffect(() => {
    console.log("useGetAllCompanies: useEffect triggered");
    const fetchCompanies = async () => {
      try {
        console.log(`Fetching companies from: ${COMPANY_API_END_POINT}/get`);
        const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
        });
        console.log("API Response:", res.data);
        if (res.data.success) {
          // Wrap the single company object in an array
          const companiesArray = res.data.company ? [res.data.company] : [];
          console.log("Dispatching companies:", companiesArray);
          dispatch(setCompanies(companiesArray));
        } else {
          console.log("API success is false, no data dispatched");
          dispatch(setCompanies([])); // Ensure empty array on failure
        }
      } catch (error) {
        console.error("Error fetching companies:", error.message);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        }
        dispatch(setCompanies([])); // Ensure empty array on error
      }
    };
    fetchCompanies();
  }, []);

  return;
};

export default useGetAllCompanies;