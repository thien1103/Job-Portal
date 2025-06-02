import { FilterCard, mapLocationToFilter } from './FilterCard';
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import axios from 'axios';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setRecommendedJobs, setLoading, setError } from '@/redux/recommendJobSlice';
import { setSavedJobIds } from '@/redux/jobSlice';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const RecommendedJobs = () => {
  const { recommendedJobs, loading, error } = useSelector((store) => store.recommendJob);
  const { searchedQuery, savedJobIds } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const location = useLocation();
  const [filterJobs, setFilterJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const jobsPerPage = 6;
  const [query, setQuery] = useState("");

  // Fetch recommended jobs
  const fetchRecommendedJobs = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      console.log("Fetching recommended jobs from API...");
      const res = await axios.get(`${JOB_API_END_POINT}/recommended-jobs`, {
        withCredentials: true,
      });
      console.log("Recommended jobs response:", res.data);
      if (res.data.success) {
        // Check if data is an array directly or nested
        const jobData = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
        console.log("Raw job data:", jobData);
        const jobsWithLocationType = jobData.map(job => ({
          ...job,
          _id: job.id, // Map `id` to `_id` for Job component compatibility
          locationType: mapLocationToFilter(job.location || ''),
          company: {
            ...job.company,
            logo: job.company.logo || 'https://via.placeholder.com/40', // Fallback logo
          },
          description: job.description || [],
          createdAt: job.createdAt || new Date().toISOString(),
        }));
        dispatch(setRecommendedJobs(jobsWithLocationType));
        console.log("Processed recommended jobs:", jobsWithLocationType);
      } else {
        dispatch(setRecommendedJobs([]));
        console.log("No valid jobs found: success is false");
      }
    } catch (error) {
      console.error('Failed to fetch recommended jobs:', error);
      dispatch(setError(error.message || "Failed to fetch recommended jobs"));
      dispatch(setRecommendedJobs([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    try {
      console.log("Fetching saved jobs from API...");
      const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
        withCredentials: true,
      });
      console.log("Saved jobs response:", res.data);
      if (res.data.success) {
        const savedIds = res.data.jobs.map(job => job.id) || [];
        dispatch(setSavedJobIds(savedIds));
        console.log("Saved job IDs:", savedIds);
      } else {
        dispatch(setSavedJobIds([]));
        console.log("No saved jobs found");
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
      dispatch(setSavedJobIds([]));
    }
  }, [dispatch]);

  // Fetch jobs and saved jobs on mount and when refresh is signaled
  useEffect(() => {
    console.log("Component mounted, fetching data...");
    fetchRecommendedJobs();
    fetchSavedJobs();
    if (location.state?.refresh) {
      console.log("Refresh triggered via location state");
      fetchRecommendedJobs();
      fetchSavedJobs();
      window.history.replaceState({}, document.title);
    }
  }, [fetchRecommendedJobs, fetchSavedJobs, location.state]);

  // Local search and filter logic
  useEffect(() => {
    console.log("Filtering jobs, current recommendedJobs:", recommendedJobs);
    if (!Array.isArray(recommendedJobs)) {
      setFilterJobs([]);
      console.log("No jobs to filter, recommendedJobs is not an array");
      return;
    }

    let filteredJobs = recommendedJobs;

    // Apply local search based on query
    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      filteredJobs = recommendedJobs.filter((job) => {
        const descriptionText = Array.isArray(job.description)
          ? job.description.join(' ').toLowerCase()
          : job.description?.toLowerCase() || '';
        const matchedSkillsText = Array.isArray(job.matchedSkills)
          ? job.matchedSkills.join(' ').toLowerCase()
          : job.matchedSkills?.toLowerCase() || '';
        return (
          job.title?.toLowerCase().includes(normalizedQuery) ||
          descriptionText.includes(normalizedQuery) ||
          job.location?.toLowerCase().includes(normalizedQuery) ||
          job.jobType?.toLowerCase().includes(normalizedQuery) ||
          job.level?.toLowerCase().includes(normalizedQuery) ||
          job.company?.name?.toLowerCase().includes(normalizedQuery) ||
          matchedSkillsText.includes(normalizedQuery)
        );
      });
      console.log("Filtered jobs after search query:", filteredJobs);
    }

    // Apply additional filters from searchedQuery
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
      console.log("Filtered jobs after searchedQuery:", filteredJobs);
    }

    setFilterJobs(filteredJobs);
    setCurrentPage(1);
    console.log("Final filtered jobs:", filteredJobs);
  }, [recommendedJobs, searchedQuery, query]);

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
        {/* Search Bar */}
        <div className='mb-8 flex justify-center'>
          <div className='relative flex w-full max-w-[700px] items-center shadow-lg border border-gray-200 rounded-full bg-white transition-all duration-300 hover:shadow-xl'>
            <input
              type="text"
              placeholder='Search recommended jobs...'
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
            {loading ? (
              <span className='text-gray-500 text-center mt-10'>Loading recommended jobs...</span>
            ) : error ? (
              <span className='text-red-500 text-center mt-10'>Error: {error}</span>
            ) : filterJobs.length <= 0 ? (
              <span className='text-gray-500 text-center mt-10'>No recommended jobs found</span>
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
  <Job key={job?._id} job={job} savedJobIds={savedJobIds} />
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

export default RecommendedJobs;