import React, { useState, useEffect } from "react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);
  const [filterText, setFilterText] = useState("");

  // Fetch applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/users/applicants`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setApplicants(data.users);
          setAllApplicants(data.users);
        } else {
          console.error("Error:", data);
          setApplicants([]);
          setAllApplicants([]);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setApplicants([]);
        setAllApplicants([]);
      }
    };
    fetchApplicants();
  }, []);

  // Handle filter across fullname, email, and role
  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterText(value);
    if (value === "") {
      setApplicants(allApplicants);
    } else {
      setApplicants(
        allApplicants.filter(
          (applicant) =>
            applicant.fullname.toLowerCase().includes(value) ||
            applicant.email.toLowerCase().includes(value) ||
            applicant.role.toLowerCase().includes(value)
        )
      );
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await fetch(`${ADMIN_API_END_POINT}/users/${_id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Applicant deleted successfully!");
        setApplicants(applicants.filter((applicant) => applicant._id !== _id));
        setAllApplicants(allApplicants.filter((applicant) => applicant._id !== _id));
      }
    } catch (error) {
      toast.error("Error deleting applicant!");
      console.error("Error deleting applicant:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Applicants Management</h2>
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
      {/* Applicants Table */}
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Full Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant._id} className="border-b">
                <td className="p-2">{applicant.fullname}</td>
                <td className="p-2">{applicant.email}</td>
                <td className="p-2">{applicant.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(applicant._id)}
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

export default Applicants;