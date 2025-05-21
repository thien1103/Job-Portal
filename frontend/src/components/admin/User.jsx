import React, { useState, useEffect } from "react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all users for filtering
  const [filterText, setFilterText] = useState(""); // State for filter input

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/users`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          console.log("Data fetched: ", data);
          setUsers(data.users);
          setAllUsers(data.users); // Store all users for filtering
        } else {
          console.error("Error:", data);
          setUsers([]);
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Handle filter across all fields
  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterText(value);
    if (value === "") {
      setUsers(allUsers); // Reset to all users if filter is empty
    } else {
      setUsers(
        allUsers.filter(
          (user) =>
            user.fullname.toLowerCase().includes(value) ||
            user.email.toLowerCase().includes(value) ||
            user.role.toLowerCase().includes(value)
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
        toast.success("User deleted successfully!");
        setUsers(users.filter((user) => user._id !== _id));
        setAllUsers(allUsers.filter((user) => user._id !== _id));
      }
    } catch (error) {
        toast.error("Error deleting user!");
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>
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
      {/* Users Table */}
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
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-2">{user.fullname}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(user._id)}
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

export default Users;
