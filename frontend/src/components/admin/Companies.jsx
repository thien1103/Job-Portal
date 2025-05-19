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

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/companies`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.companies)) {
          setCompanies(data.companies);
          setAllCompanies(data.companies);
        } else {
          console.error("Error:", data);
          setCompanies([]);
          setAllCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
        setAllCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
    if (value === "") {
      setCompanies(allCompanies);
    } else {
      setCompanies(
        allCompanies.filter((company) => {
          const nameMatch = company.name.includes(value);
          const ownerMatch = company.userId?.fullname?.includes(value) || false;
          const emailMatch = company.userId?.email?.includes(value) || false;
          return nameMatch || ownerMatch || emailMatch;
        })
      );
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await fetch(`${ADMIN_API_END_POINT}/companies/${_id}`, {
        credentials: "include",
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Company deleted successfully!");
        setCompanies(companies.filter((c) => c._id !== _id));
        setAllCompanies(allCompanies.filter((c) => c._id !== _id));
      }
    } catch (error) {
      toast.error("Error deleting company!");
      console.error("Error deleting company:", error);
    } finally {
      setSelectedCompanyId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Companies Management</h2>

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
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Owner</th>
              <th className="p-2 text-left">Owner Email</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id} className="border-b">
                <td className="p-2">{company.name}</td>
                <td className="p-2">{company.userId?.fullname || "N/A"}</td>
                <td className="p-2">{company.userId?.email || "N/A"}</td>
                <td className="p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedCompanyId(company._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this company? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedCompanyId)}
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

export default Companies;
