import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { setAllJobs } from '@/redux/jobSlice';
import { useLocation } from 'react-router-dom'; // Import useLocation to access navigation state

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector((store) => store.job);
    const dispatch = useDispatch();
    const location = useLocation(); // Get navigation state
    const [filterJobs, setFilterJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [direction, setDirection] = useState(0);
    const jobsPerPage = 6;

    // Fetch all jobs
    const fetchAllJobs = useCallback(async () => {
        try {
            const res = await axios.get(`${JOB_API_END_POINT}`, {
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setAllJobs(res.data.jobs));
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }, [dispatch]);

    // Fetch jobs on mount and when refresh is signaled via navigation
    useEffect(() => {
        fetchAllJobs(); // Initial fetch on mount
        // Check if navigation state indicates a refresh
        if (location.state?.refresh) {
            fetchAllJobs(); // Re-fetch if refresh is true
            // Clear the state to avoid repeated refreshes
            window.history.replaceState({}, document.title);
        }
    }, [fetchAllJobs, location.state]);

    useEffect(() => {
        if (Array.isArray(allJobs)) {
            if (searchedQuery && Object.values(searchedQuery).some(val => val)) {
                const filteredJobs = allJobs.filter((job) => {
                    const descriptionText = Array.isArray(job.description)
                        ? job.description.join(' ').toLowerCase()
                        : job.description?.toLowerCase() || '';
                    const matchesJobType = searchedQuery.jobType
                        ? job.jobType.toLowerCase() === searchedQuery.jobType.toLowerCase()
                        : true;
                    const matchesLevel = searchedQuery.level
                        ? (job.level || '').toLowerCase() === searchedQuery.level.toLowerCase()
                        : true;
                    const matchesLocation = searchedQuery.location
                        ? ['hồ chí minh', 'hà nội'].includes(job.location?.toLowerCase())
                        : true;
                    return matchesJobType && matchesLevel && matchesLocation;
                });
                setFilterJobs(filteredJobs);
            } else {
                setFilterJobs(allJobs);
            }
            setCurrentPage(1); // Reset to page 1 when jobs or filter changes
        } else {
            setFilterJobs([]); // Fallback to empty array if allJobs is not an array
        }
    }, [allJobs, searchedQuery]);

    // Calculate current jobs for the page
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
            <div className='max-w-[1300px] mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-[20%] max-h-[800px]'>
                        <FilterCard />
                    </div>
                    <div className='flex-1 flex flex-col min-h-screen'>
                        {filterJobs.length <= 0 ? (
                            <span className='text-gray-500'>No jobs found</span>
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
                                                    <Job job={job} />
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