// hooks/useGetAllRecruiterJobs.js (assumed)
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { setAllRecruiterJobs, setLoading, setError } from '@/redux/jobSlice';

const useGetAllRecruiterJobs = () => {
  const dispatch = useDispatch();
  const { allRecruiterJobs } = useSelector((state) => state.job);

  useEffect(() => {
    const fetchRecruiterJobs = async () => {
      try {
        console.log('Fetching all recruiter jobs');
        dispatch(setLoading(true));
        const res = await axios.get(`${JOB_API_END_POINT}/recruiter`, { withCredentials: true });
        console.log('Recruiter Jobs API Response:', res.data);
        if (res.data.success) {
          dispatch(setAllRecruiterJobs(res.data.jobs));
          console.log('Recruiter jobs dispatched to Redux:', res.data.jobs);
        }
      } catch (error) {
        console.error('Error fetching recruiter jobs:', error.response?.data || error.message);
        dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchRecruiterJobs();
  }, [dispatch]);

  return allRecruiterJobs;
};

export default useGetAllRecruiterJobs;