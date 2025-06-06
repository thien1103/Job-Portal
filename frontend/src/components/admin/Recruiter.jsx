import React, { useState, useEffect } from "react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Recruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [allRecruiters, setAllRecruiters] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/users/recruiters`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setRecruiters(data.users);
          setAllRecruiters(data.users);
        } else {
          console.error("Error:", data);
          setRecruiters([]);
          setAllRecruiters([]);
        }
      } catch (error) {
        console.error("Error fetching recruiters:", error);
        setRecruiters([]);
        setAllRecruiters([]);
      }
    };
    fetchRecruiters();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
    if (value === "") {
      setRecruiters(allRecruiters);
    } else {
      setRecruiters(
        allRecruiters.filter(
          (recruiter) =>
            recruiter.fullname.includes(value) ||
            recruiter.email.includes(value) ||
            recruiter.role.includes(value)
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
        toast.success("Recruiter deleted successfully!");
        setRecruiters(recruiters.filter((r) => r._id !== _id));
        setAllRecruiters(allRecruiters.filter((r) => r._id !== _id));
      }
    } catch (error) {
      toast.error("Error deleting recruiter!");
      console.error("Error deleting recruiter:", error);
    } finally {
      setSelectedRecruiterId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recruiters Management</h2>

      {/* Filter */}
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

      {/* Table */}
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
            {recruiters.map((recruiter) => (
              <tr key={recruiter._id} className="border-b">
                <td className="p-2">{recruiter.fullname}</td>
                <td className="p-2">{recruiter.email}</td>
                <td className="p-2">{recruiter.role}</td>
                <td className="p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedRecruiterId(recruiter._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this recruiter? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedRecruiterId)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recruiters;
