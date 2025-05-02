import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import logo from '../../assets/logo.png';
import NavBarBanner from "../ui/navbar_banner";

const Navbar = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout thất bại");
    }
  }

  return (
    <div className='bg-white'>
      <div className='p-2'>
        <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
          
          {/* Logo */}
          <div className='flex items-center justify-center'>
            <img className='h-20 w-20' src={logo} alt="Logo" />
            <h1 className='ml-2 text-2xl font-bold'>
              Job <span className='text-[#087658]'>Partner</span>
            </h1>
          </div>

          {/* Navigation links */}
          <div className='flex items-center gap-12'>
            <ul className='flex font-medium items-center gap-5'>
              {user && user.role === 'recruiter' ? (
                // Nếu là recruiter thì chỉ thấy menu admin
                <>
                  <li>
                    <Link
                      to="/admin/companies"
                      className="text-[#087658] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                    >
                      Companies
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/jobs"
                      className="text-[#087658] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                    >
                      Jobs
                    </Link>
                  </li>
                </>
              ) : (
                // Nếu không phải recruiter (hoặc chưa login) thì xem menu public
                <>
                  <li>
                    <Link
                      to="/"
                      className="text-[grey] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/jobs"
                      className="text-[grey] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                    >
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careerHandbook"
                      className="text-[grey] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                    >
                      Career Handbook
                    </Link>
                  </li>
                  {/* Chỉ show My CV khi đã login và role là applicant */}
                  {user && user.role === 'applicant' && (
                    <li>
                      <Link
                        to="/myCV"
                        className="text-[grey] text-xl font-bold px-4 py-2 hover:bg-[#08761d] hover:text-white rounded-3xl transition-colors"
                      >
                        My CV
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            {/* Login / User avatar */}
            {!user ? (
              <div className='flex items-center gap-2'>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#087658] hover:bg-[#08761d]">Signup</Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt={user?.fullname}
                      className="w-10 h-10 object-cover"
                    />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div>
                    <div className='flex gap-2 items-center'>
                      <Avatar>
                        <AvatarImage
                          src={user?.profile?.profilePhoto}
                          alt={user?.fullname}
                          className="w-10 h-10 object-cover"
                        />
                      </Avatar>
                      <div>
                        <h4 className='font-medium'>{user?.fullname}</h4>
                        <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                      </div>
                    </div>
                    <div className='flex flex-col my-2 text-gray-600'>
                      {/* Chỉ show View Profile cho applicant */}
                      {user.role === 'applicant' && (
                        <div className='flex items-center gap-2 cursor-pointer'>
                          <User2 />
                          <Button variant="link">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                      )}
                      <div className='flex items-center gap-2 cursor-pointer'>
                        <LogOut />
                        <Button onClick={logoutHandler} variant="link">
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
      <NavBarBanner />
    </div>
  );
}

export default Navbar;
