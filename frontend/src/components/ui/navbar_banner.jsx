import React from 'react';
import bannerImage from '../../assets/navbar_banner.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NavBarBanner = () => {
  const { user } = useSelector((state) => state.auth);

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

  return (
    <div
      className="mt-4 p-1 flex items-center justify-center h-[50px] bg-cover bg-center"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className="flex items-center gap-2">
        <p className="text-s font-semibold m-0 leading-5">
          {promptText}
        </p>
        <Link
          to={buttonLink}
          className="font-semibold bg-green-700 text-white text-s px-4 py-1 rounded-3xl hover:bg-green-800 leading-5 flex items-center ml-4"
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
  );
};

export default NavBarBanner;
