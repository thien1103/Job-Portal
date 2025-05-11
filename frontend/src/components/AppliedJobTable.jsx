import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setAllAppliedJobs, setLoading } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";

const AppliedJobTable = () => {
  const dispatch = useDispatch();
  const { allAppliedJobs: appliedJobs } = useSelector((store) => store.job);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
          withCredentials: true,
        });
        console.log("Fetched applications:", response.data.applications);
        dispatch(setAllAppliedJobs(response.data.applications));
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        // No error state set; log only for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []); // Empty dependency array to run once

  // Log state changes to debug
  console.log("Current appliedJobs:", appliedJobs);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Job Title</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appliedJobs?.length > 0 ? (
            appliedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-100">
                <td className="border p-2 text-center">{job.job.title}</td>
                <td className="border p-2 text-center">{job.job.company.name}</td>
                <td
                  className={`border p-2 text-center ${
                    job.status === "pending"
                      ? "text-orange-500"
                      : job.status === "rejected"
                      ? "text-red-500"
                      : job.status === "accepted"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {job.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border p-2 text-center">
                No jobs applied yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppliedJobTable;