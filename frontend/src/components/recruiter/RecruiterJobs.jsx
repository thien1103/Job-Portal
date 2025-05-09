import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RecruiterJobsTable from './RecruiterJobsTable';
import useGetAllRecruiterJobs from '@/hooks/useGetAllRecruiterJobs';
import { setSearchJobByText } from '@/redux/jobSlice';
import { toast } from 'sonner';

const RecruiterJobs = () => {
    useGetAllRecruiterJobs();
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { allRecruiterJobs: recruiterJobs, loading: jobsLoading, error: jobsError } = useSelector((state) => state.job);

    useEffect(() => {
        dispatch(setSearchJobByText(input));
    }, [input, dispatch]);

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10'>
                <div className='flex items-center justify-between my-5'>
                    <Input
                        className='w-fit'
                        placeholder='Filter by name, role'
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={() => navigate('/recruiter/jobs/create')}>New Jobs</Button>
                </div>
                <RecruiterJobsTable 
                    jobs={recruiterJobs} 
                    loading={jobsLoading} 
                    error={jobsError} 
                />
            </div>
        </div>
    );
};

export default RecruiterJobs;