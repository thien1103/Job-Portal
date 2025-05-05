import { setAllRecruiterJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllRecruiterJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchAllRecruiterJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/recruiter`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllRecruiterJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllRecruiterJobs();
    },[])
}

export default useGetAllRecruiterJobs