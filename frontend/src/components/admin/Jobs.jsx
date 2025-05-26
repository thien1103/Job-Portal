import React, { useState, useEffect } from "react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [filterText, setFilterText] = useState("");

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/jobs`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
          setAllJobs(data.jobs);
        } else {
          console.error("Error:", data);
          setJobs([]);
          setAllJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        setAllJobs([]);
      }
    };
    fetchJobs();
  }, []);

  // Handle filter on title
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
    if (value === "") {
      setJobs(allJobs);
    } else {
      setJobs(
        allJobs.filter((job) => job.title.toLowerCase().includes(value))
      );
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await fetch(`${ADMIN_API_END_POINT}/jobs/${_id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Job deleted successfully!");
        setJobs(jobs.filter((job) => job._id !== _id));
        setAllJobs(allJobs.filter((job) => job._id !== _id));
      }
    } catch (error) {
      toast.error("Error deleting job!");
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Jobs Management</h2>
      {/* Filter Row */}
      <div className="mb-4 p-4 bg-white rounded shadow flex items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            value={filterText}
            onChange={handleFilterChange}
            placeholder="Search..."
            className="border p-2 pl-10 rounded w-full"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      </div>
      {/* Jobs Table */}
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Company ID</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id} className="border-b">
                <td className="p-2">{job._id}</td>
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.companyId}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Jobs;