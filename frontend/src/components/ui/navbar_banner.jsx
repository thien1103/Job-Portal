import React, { useState } from 'react';
import bannerImage from '../../assets/navbar_banner.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NavBarBanner = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Default for applicants / anonymous
  let promptText = 'Are you ready to receive the best job opportunities?';
  let buttonText = 'Upload your CV now';
  let buttonLink = '/myCV';

  // Override for recruiters
  if (user?.role === 'recruiter') {
    promptText = 'Are you ready to search for talented candidates?';
    buttonText = 'Post your job now';
    buttonLink = '/admin/jobs';
  }

  // Handle button click
  const handleButtonClick = (e) => {
    if (!user) {
      e.preventDefault(); // Prevent default navigation
      setIsDialogOpen(true); // Show dialog
    }
    // If user is logged in, navigation happens via Link
  };

  // Handle dialog login
  const handleLogin = () => {
    setIsDialogOpen(false);
    navigate('/login');
  };

  // Handle dialog cancel
  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div
        className="mt-4 p-1 flex items-center justify-center h-[50px] bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold m-0 leading-5">
            {promptText}
          </p>
          <Link
            to={user ? buttonLink : '#'} // Use # for non-logged-in to prevent navigation
            onClick={handleButtonClick}
            className="font-semibold bg-green-700 text-white text-sm px-4 py-1 rounded-3xl hover:bg-green-800 leading-5 flex items-center ml-4"
          >
            {buttonText}
            <svg
              className="ml-1 w-4 h-4 translate-y-[3px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 8l3 3m0 0l-3 3m3-3H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Dialog for non-logged-in users */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Please login to continue
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBarBanner;