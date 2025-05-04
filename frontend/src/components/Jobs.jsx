import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector((store) => store.job);
    const [filterJobs, setFilterJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [direction, setDirection] = useState(0);
    const jobsPerPage = 6; // 2 rows × 3 columns

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
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-[20%]'>
                        <FilterCard/>
                    </div>
                    <div className='flex-1 flex flex-col h-[102vh]'>
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
                                            className='grid grid-cols-3 gap-2 h-[616px]' // Fixed height for 2 rows of 300px cards + 16px gap
                                        >
                                            {currentJobs.map((job) => (
                                                <Job key={job?._id} job={job} />
                                            ))}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                {totalPages > 1 && (
                                    <div className='flex items-center justify-center mt-4 p-2 h-[80px]'>
                                        <Button
                                            className='m-4 rounded-3xl bg-[#087658] hover:bg-[#065c47]'
                                            onClick={() => {
                                                setDirection(-1);
                                                setCurrentPage((prev) => Math.max(prev - 1, 1));
                                            }}
                                            disabled={currentPage === 1}
                                        >
                                            <img
                                                src='https://cdn-icons-png.flaticon.com/128/271/271220.png'
                                                className='w-[80%] h-[80%]'
                                                alt='Previous'
                                            />
                                        </Button>
                                        <p className='font-semibold'>
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <Button
                                            className='m-4 rounded-3xl bg-[#087658] hover:bg-[#065c47]'
                                            onClick={() => {
                                                setDirection(1);
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                                            }}
                                            disabled={currentPage === totalPages}
                                        >
                                            <img
                                                src='https://cdn-icons-png.flaticon.com/128/271/271228.png'
                                                className='w-[80%] h-[80%]'
                                                alt='Next'
                                            />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;