import React, { useState } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Job from "./Job";

const JobList = ({ jobs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 2; // Changed to 2 jobs per page

  // Calculate the jobs to display for the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Calculate total pages
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Handle page navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Animation variants daylight saving time sliding effect
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
      <AnimatePresence initial={false} custom={currentPage}>
        <motion.div
          key={currentPage}
          custom={currentPage}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="grid gap-6"
        >
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => <Job key={job.id} job={job} />)
          ) : (
            <p className="text-center text-gray-500">No jobs available</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-[#087658] text-white hover:bg-[#065c47]"
          >
            Previous
          </Button>
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-[#087658] text-white hover:bg-[#065c47]"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobList;