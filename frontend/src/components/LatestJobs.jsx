import React, { useEffect, useCallback } from 'react';
import LatestJobCards from './LatestJobCards';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setSavedJobIds } from '@/redux/jobSlice';

const LatestJobs = () => {
  const { allJobs, savedJobIds } = useSelector((store) => store.job);
  const dispatch = useDispatch();

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

  // Fetch saved jobs on mount
  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return (
    <div className="max-w-7xl mx-auto my-20 mt-10">
      <h1 className="text-4xl font-bold">
        <span className="text-[#087658]">Latest & Top </span> Job Openings
      </h1>
      <div className="grid grid-cols-3 gap-4 my-5">
        {Array.isArray(allJobs) && allJobs.length > 0 ? (
          allJobs.slice(0, 6).map((job) => (
            <LatestJobCards key={job._id} job={job} savedJobIds={savedJobIds} />
          ))
        ) : (
          <span>No Job Available</span>
        )}
      </div>
    </div>
  );
};

export default LatestJobs;