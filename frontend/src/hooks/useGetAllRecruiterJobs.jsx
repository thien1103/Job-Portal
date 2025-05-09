import { setAllRecruiterJobs, setLoading, setError } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

const useGetAllRecruiterJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllRecruiterJobs = async () => {
            dispatch(setLoading(true));
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/recruiter`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllRecruiterJobs(res.data.jobs));
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    dispatch(setAllRecruiterJobs([])); // Clear jobs on 404
                    dispatch(setError('No Job Found'));
                } else {
                    dispatch(setError(error.response?.data?.message || 'Failed to fetch jobs'));
                    toast.error(error.response?.data?.message || 'Failed to load jobs. Check server status.');
                }
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchAllRecruiterJobs();
    }, [dispatch]);
};

export default useGetAllRecruiterJobs;