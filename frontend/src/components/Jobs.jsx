import { FilterCard, mapLocationToFilter } from './FilterCard'; // Use named imports
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import axios from 'axios';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setAllJobs, setSavedJobIds } from '@/redux/jobSlice';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const Jobs = () => {
  const { allJobs, searchedQuery, savedJobIds } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const location = useLocation();
  const [filterJobs, setFilterJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const jobsPerPage = 6;
  const [query, setQuery] = useState("");

  // Fetch all jobs
  const fetchAllJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${JOB_API_END_POINT}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        // Map location to locationType for each job
        const jobsWithLocationType = res.data.jobs.map(job => ({
          ...job,
          locationType: mapLocationToFilter(job.location || ''), // Fallback to empty string if location is undefined
        }));
        dispatch(setAllJobs(jobsWithLocationType || []));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      dispatch(setAllJobs([]));
    }
  }, [dispatch]);

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const savedIds = res.data.jobs.map(job => job.id) || [];
        dispatch(setSavedJobIds(savedIds));
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
      dispatch(setSavedJobIds([]));
    }
  }, [dispatch]);

  // Fetch jobs and saved jobs on mount and when refresh is signaled
  useEffect(() => {
    fetchAllJobs();
    fetchSavedJobs();
    if (location.state?.refresh) {
      fetchAllJobs();
      fetchSavedJobs();
      window.history.replaceState({}, document.title);
    }
  }, [fetchAllJobs, fetchSavedJobs, location.state]);

  // Local search and filter logic
  useEffect(() => {
    if (!Array.isArray(allJobs)) {
      setFilterJobs([]);
      return;
    }

    let filteredJobs = allJobs;

    // Apply local search based on query
    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      filteredJobs = allJobs.filter((job) => {
        const descriptionText = Array.isArray(job.description)
          ? job.description.join(' ').toLowerCase()
          : job.description?.toLowerCase() || '';
        return (
          job.title?.toLowerCase().includes(normalizedQuery) ||
          descriptionText.includes(normalizedQuery) ||
          job.location?.toLowerCase().includes(normalizedQuery) ||
          job.jobType?.toLowerCase().includes(normalizedQuery) ||
          job.level?.toLowerCase().includes(normalizedQuery) ||
          job.company?.name?.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    // Apply additional filters from searchedQuery (e.g., from FilterCard)
    if (searchedQuery && Object.values(searchedQuery).some(val => val)) {
      filteredJobs = filteredJobs.filter((job) => {
        const matchesJobType = searchedQuery.jobType
          ? job.jobType?.toLowerCase() === searchedQuery.jobType.toLowerCase()
          : true;
        const matchesLevel = searchedQuery.level
          ? (job.level || '').toLowerCase() === searchedQuery.level.toLowerCase()
          : true;
        const matchesLocation = searchedQuery.location
          ? (searchedQuery.location === "Others"
              ? job.locationType === "Others"
              : (job.locationType || '').toLowerCase() === searchedQuery.location.toLowerCase())
          : true;
        return matchesJobType && matchesLevel && matchesLocation;
      });
    }

    setFilterJobs(filteredJobs);
    setCurrentPage(1); // Reset to page 1 when jobs or filter changes
  }, [allJobs, searchedQuery, query]);

  // Pagination calculations
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = Array.isArray(filterJobs) ? filterJobs.slice(indexOfFirstJob, indexOfLastJob) : [];
  const totalPages = Math.ceil((filterJobs.length || 0) / jobsPerPage);

  // Debug logging
  console.log('filterJobs:', filterJobs, 'filterJobs.length:', filterJobs.length);
  console.log('currentPage:', currentPage, 'totalPages:', totalPages, 'currentJobs:', currentJobs);

  // Define sliding animation variants
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
        {/* Prettified Search Bar */}
        <div className='mb-8 flex justify-center'>
          <div className='relative flex w-full max-w-[700px] items-center shadow-lg border border-gray-200 rounded-full bg-white transition-all duration-300 hover:shadow-xl'>
            <input
              type="text"
              placeholder='Search for your dream job...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='flex-1 outline-none border-none bg-transparent py-3 px-6 text-gray-700 placeholder-gray-400 focus:ring-0'
            />
            <Button
              className='rounded-full bg-[#087658] hover:bg-[#065c47] m-1 p-3 transition-colors duration-200'
            >
              <Search className='h-5 w-5 text-white' />
            </Button>
          </div>
        </div>

        <div className='flex gap-5'>
          <div className='w-[20%] max-h-[800px]'>
            <FilterCard />
          </div>
          <div className='flex-1 flex flex-col min-h-screen'>
            {filterJobs.length <= 0 ? (
              <span className='text-gray-500 text-center mt-10'>No jobs found</span>
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
                        <div key={job?._id} className='scale-90'>
                          <Job job={job} savedJobIds={savedJobIds} />
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
      </div>
    </div>
  );
};

export default Jobs;