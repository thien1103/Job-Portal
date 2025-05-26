import { setSingleCompany } from "@/redux/companySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();
  console.log("useGetCompanyById hook called with ID:", companyId);

  useEffect(() => {
    console.log("useGetCompanyById: useEffect triggered");
    const fetchCompany = async () => {
      try {
        console.log(`Fetching company from: ${COMPANY_API_END_POINT}/${companyId}`);
        const res = await axios.get(`${COMPANY_API_END_POINT}/${companyId}`, {
          withCredentials: true,
        });
        console.log("API Response:", res.data);
        if (res.data.success) {
          console.log("Dispatching single company:", res.data.company);
          dispatch(setSingleCompany(res.data.company));
        } else {
          console.log("API success is false, no data dispatched");
          dispatch(setSingleCompany(null));
        }
      } catch (error) {
        console.error("Error fetching company:", error.message);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        }
        dispatch(setSingleCompany(null));
      }
    };
    fetchCompany();
  }, [companyId]);
};

export default useGetCompanyById;