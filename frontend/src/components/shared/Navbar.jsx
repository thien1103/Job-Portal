import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Animation variants for the logo
const logoVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

// Animation variants for nav items
const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
  hover: {
    scale: 1.1,
    color: '#000000',
    transition: { duration: 0.2 },
  },
};

// Animation variants for buttons/avatar
const buttonVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Animation variants for mobile menu
const menuVariants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  closed: { opacity: 0, x: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
};

// Hamburger line animations
const lineVariants = {
  open: { rotate: 45, y: 6 },
  closed: { rotate: 0, y: 0 },
};
const line2Variants = {
  open: { opacity: 0 },
  closed: { opacity: 1 },
};
const line3Variants = {
  open: { rotate: -45, y: -6 },
  closed: { rotate: 0, y: 0 },
};

const NavItem = ({ itemName, to, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const onHoverStart = () => setIsHovered(true);
  const onHoverEnd = () => setIsHovered(false);

  return (
    <motion.li
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className='px-4 py-2 text-black/75 font-[500] text-xl hover:text-black transition-colors duration-300'
      custom={0}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Link
        className='relative cursor-pointer py-1.5'
        to={to}
        onClick={onClick}
      >
        {itemName}
        <AnimatePresence>
          {isHovered && <Underline />}
        </AnimatePresence>
      </Link>
    </motion.li>
  );
};

const Underline = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      layoutId='underline'
      className='absolute -bottom-[1px] bg-gradient-to-r from-green-800 via-green-300 to-rose-800 h-1 w-full'
    />
  );
};

const Navbar = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
  };

  return (
    <div className='bg-white shadow-lg'>
      <div className='p-2'>
        <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
          {/* Logo */}
          <motion.div
            className='flex items-center justify-center'
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/" className="flex items-center">
              <img className='h-20 w-20' src={logo} alt="Logo" />
              <h1 className='ml-2 text-2xl font-bold'>
                Job <span className='text-[#087658]'>Partner</span>
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className='flex items-center gap-12'>
            <div className='hidden md:block'>
              <ul className='flex font-[500] items-center gap-5'>
                {user && user.role === 'recruiter' ? (
                  <>
                    <NavItem itemName='Companies' to='/recruiter/companies' />
                    <NavItem itemName='Jobs' to='/recruiter/jobs' />
                  </>
                ) : (
                  <>
                    <NavItem itemName='Home' to='/' />
                    <NavItem itemName='Jobs' to='/jobs' />
                    <NavItem itemName='Career Handbook' to='/careerHandbook' />
                    {user && user.role === 'applicant' && (
                      <NavItem itemName='My CV' to='/myCV' />
                    )}
                  </>
                )}
              </ul>
            </div>

            {/* Hamburger Menu for Mobile */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                <motion.div className="space-y-2">
                  <motion.span
                    className="block w-8 h-1 bg-gray-600 rounded"
                    animate={isOpen ? 'open' : 'closed'}
                    variants={lineVariants}
                  />
                  <motion.span
                    className="block w-8 h-1 bg-gray-600 rounded"
                    animate={isOpen ? 'open' : 'closed'}
                    variants={line2Variants}
                  />
                  <motion.span
                    className="block w-8 h-1 bg-gray-600 rounded"
                    animate={isOpen ? 'open' : 'closed'}
                    variants={line3Variants}
                  />
                </motion.div>
              </button>
            </div>

            {/* Login / User Avatar */}
            {!user ? (
              <motion.div
                className='flex items-center gap-2'
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div whileHover="hover" variants={buttonVariants}>
                  <Link to="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                </motion.div>
                <motion.div whileHover="hover" variants={buttonVariants}>
                  <Link to="/signup">
                    <Button className="bg-[#087658] hover:bg-[#08761d]">Signup</Button>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
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
                          <p className='text-sm text-muted-foreground line-clamp-1'>{user?.profile?.bio}</p>
                        </div>
                      </div>
                      <div className='flex flex-col my-2 text-gray-600'>
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
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden bg-white shadow-lg absolute top-16 left-0 w-full z-50"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <ul className='flex flex-col font-[500] gap-4 py-4 px-6'>
                {user && user.role === 'recruiter' ? (
                  <>
                    <NavItem itemName='Companies' to='/recruiter/companies' onClick={() => setIsOpen(false)} />
                    <NavItem itemName='Jobs' to='/recruiter/jobs' onClick={() => setIsOpen(false)} />
                  </>
                ) : (
                  <>
                    <NavItem itemName='Home' to='/' onClick={() => setIsOpen(false)} />
                    <NavItem itemName='Jobs' to='/jobs' onClick={() => setIsOpen(false)} />
                    <NavItem itemName='Career Handbook' to='/careerHandbook' onClick={() => setIsOpen(false)} />
                    {user && user.role === 'applicant' && (
                      <NavItem itemName='My CV' to='/myCV' onClick={() => setIsOpen(false)} />
                    )}
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <NavBarBanner />
    </div>
  );
};

export default Navbar;