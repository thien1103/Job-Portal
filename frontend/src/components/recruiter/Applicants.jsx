import React, { useEffect } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${JOB_API_END_POINT}/${params.id}/applications`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          console.log("fetchAllApplicant data: ", res.data);
          dispatch(setAllApplicants(res.data.applications));
        }
      } catch (error) {
        console.error("Error fetching applicants:", error.response?.data || error.message);
      }
    };
    fetchAllApplicants();
  }, [params.id, dispatch]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-12">
        {applicants?.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-10">
            No Applicant Yet
          </div>
        ) : (
          <ApplicantsTable />
        )}
      </div>
    </div>
  );
};

export default Applicants;