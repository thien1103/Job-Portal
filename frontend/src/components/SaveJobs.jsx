import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import axios from 'axios';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setAllJobs } from '@/redux/jobSlice';

const SavedJobs = () => {
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const [filterJobs, setFilterJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const jobsPerPage = 6;

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAllJobs(res.data.jobs || []));
        setFilterJobs(res.data.jobs || []);
      } else {
        setError('Failed to fetch saved jobs');
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
      setError(error.response?.data?.message || 'Failed to fetch saved jobs');
      dispatch(setAllJobs([]));
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs on mount
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  // Update filtered jobs when allJobs changes
  useEffect(() => {
    if (Array.isArray(allJobs)) {
      setFilterJobs(allJobs);
      setCurrentPage(1);
    } else {
      setFilterJobs([]);
    }
  }, [allJobs]);

  // Pagination calculations
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = Array.isArray(filterJobs) ? filterJobs.slice(indexOfFirstJob, indexOfLastJob) : [];
  const totalPages = Math.ceil((filterJobs.length || 0) / jobsPerPage);

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div>
      <Navbar />
      <div className='max-w-[1300px] mx-auto mt-8'>
        <h1 className='text-3xl font-bold mb-6'>Your Saved Jobs</h1>
        {loading ? (
          <div className='text-center'>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className='text-center bg-red-100 p-4 rounded-lg'>
            <p className='text-red-600'>{error}</p>
            <Button
              className='mt-4 bg-[#087658] hover:bg-[#065c47]'
              onClick={fetchSavedJobs}
            >
              Retry
            </Button>
          </div>
        ) : filterJobs.length <= 0 ? (
          <div className='text-center'>
            <span className='text-gray-500'>No saved jobs found</span>
            <img
              src='https://cdn-icons-png.flaticon.com/128/7486/7486744.png'
              alt='No saved jobs'
              className='mt-4 mx-auto w-32 h-32'
            />
          </div>
        ) : (
          <>
            <div className='flex-1 pb-5 overflow-hidden'>
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{ duration: 0.5 }}
                  className='grid grid-cols-3 gap-2 w-full'
                >
                  {currentJobs.map((job) => (
                    <div key={job?.id} className='scale-90'>
                      <Job job={job} isSavedJobsPage={true} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className='flex items-center justify-center p-2 h-[80px]'>
              <Button
                className='m-4 w-10 h-10 rounded-full bg-[#087658] hover:bg-[#065c47]'
                onClick={() => {
                  setDirection(-1);
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
                disabled={currentPage === 1}
              >
                <img
                  src='https://cdn-icons-png.flaticon.com/128/271/271220.png'
                  className='w-6 h-6 object-contain'
                  alt='Previous'
                />
              </Button>
              <p className='font-semibold'>
                Page {currentPage} of {totalPages}
              </p>
              <Button
                className='m-4 w-10 h-10 rounded-full bg-[#087658] hover:bg-[#065c47]'
                onClick={() => {
                  setDirection(1);
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                disabled={currentPage === totalPages}
              >
                <img
                  src='https://cdn-icons-png.flaticon.com/128/271/271228.png'
                  className='w-6 h-6 object-contain'
                  alt='Next'
                />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;