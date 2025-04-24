import React from 'react';
import bannerImage from '../../assets/navbar_banner.png'; // Adjust the path as necessary
import { Link } from 'react-router-dom';

const NavBarBanner = () => {
    return (
        <div 
            className="mt-4 p-1 flex items-center justify-center h-[50px] bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerImage})` }}
        >
            <div className="flex items-center gap-2">
                <p className="text-s font-semibold m-0 leading-5">
                    Bạn đã sẵn sàng để nhận được những cơ hội việc làm tốt nhất?
                </p>
                <Link 
                    to="/myCV" 
                    className="font-semibold bg-green-700 text-white text-s px-4 py-1 rounded-3xl hover:bg-green-800 leading-5 flex items-center ml-4"
                >
                    Tải lên CV của bạn 
                    <svg 
                        className="ml-1 w-4 h-4 translate-y-[3px]" // Changed from translate-y-1 to translate-y-[3px]
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
}

export default NavBarBanner;