import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faUsers, faBuilding, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ isOpen }) => {
  // State để kiểm soát submenu của Users
  const [isUsersOpen, setIsUsersOpen] = React.useState(false);

  const toggleUsersMenu = () => {
    setIsUsersOpen(!isUsersOpen);
  };

  return (
    <div
      className={`h-full text-white transition-all duration-300 ease-in-out ${isOpen ? "p-4" : ""}`}
      style={{
        width: isOpen ? "16rem" : "0",
        backgroundImage: isOpen
          ? "url('https://github.com/modularcode/modular-admin-react/blob/master/src/_common/AppSidebar/_assets/AppSidebarBg.jpg?raw=true')"
          : "none",
        overflow: "hidden",
      }}
    >
      {isOpen && (
        <>
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-tr from-blue-900 to-gray-800 rounded-lg px-6 py-3">
              Admin Panel
            </h2>
          </div>
          <nav>
            <ul className="space-y-2">
              <li className="mb-2">
                <div
                  className="flex items-center p-2 text-white hover:text-black rounded-lg cursor-pointer transition-colors duration-200 text-xl"
                  onClick={toggleUsersMenu} // Chỉ mở/tắt submenu
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-3" />
                  <span className="flex-1">Users</span>
                  <FontAwesomeIcon
                    icon={isUsersOpen ? faChevronUp : faChevronDown}
                    className="text-sm"
                  />
                </div>
                {isUsersOpen && (
                  <ul className="ml-6 mt-2 space-y-1 slide-down">
                    <li>
                      <Link
                        to="/admin/users/applicants"
                        className="flex items-center p-2 text-white hover:text-black rounded-lg transition-colors duration-200"
                      >
                        + Applicants
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/users/recruiters"
                        className="flex items-center p-2 text-white hover:text-black rounded-lg transition-colors duration-200"
                      >
                        + Recruiters
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <hr className="border-gray-700" />
              <li className="mb-2">
                <Link
                  to="/admin/companies"
                  className="flex items-center p-2 text-white hover:text-black rounded-lg transition-colors duration-200 text-xl"
                >
                  <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                  Companies
                </Link>
              </li>
              <hr className="border-gray-700" />
              <li className="mb-2">
                <Link
                  to="/admin/statistics"
                  className="flex items-center p-2 text-white hover:text-black rounded-lg transition-colors duration-200 text-xl"
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-3" />
                  Statistics
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}

      <style jsx>{`
        .slide-down {
          animation: slideDown 0.3s ease-in-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;