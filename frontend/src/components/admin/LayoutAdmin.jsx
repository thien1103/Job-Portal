import React, { useState } from "react";
import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out" style={{ width: isSidebarOpen ? "calc(100% - 16rem)" : "100%" }}>
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;