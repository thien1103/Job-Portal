import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, COMPANY_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const isInitiallyApplied = singleJob?.applications?.some((application) => application.applicant === user?._id) || false;
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const [companyData, setCompanyData] = useState(null);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const applyJobHandler = async () => {
    try {
      console.log('Fetching Apply Job Handler');
      const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });
      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          applications: [...(singleJob?.applications || []), { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Tải lên thất bại.');
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        console.log('Fetching Single Job');
        const res = await axios.get(`${JOB_API_END_POINT}/${jobId}`, { withCredentials: true });
        if (res.data.success) {
          console.log('Single Job Data: ', res.data);
          dispatch(setSingleJob(res.data.job));
          setIsApplied(res.data.job.applications?.some((application) => application.applicant === user?._id) || false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (user && singleJob?.company) {
        try {
          console.log('Fetching Company Data');
          const res = await axios.get(`${COMPANY_API_END_POINT}/${singleJob.company}`, { withCredentials: true });
          if (res.data.success) {
            console.log('Get Company Data: ', res.data);
            setCompanyData(res.data.company);
          }
        } catch (error) {
          console.log(error);
          toast.error('Không thể tải thông tin công ty.');
        }
      }
    };
    fetchCompanyData();
  }, [user, singleJob]);

  // Handle Review Company button click
  const handleReviewCompany = () => {
    if (user) {
      // User is logged in, open the company website
      window.open(companyData?.website, '_blank');
    } else {
      // User is not logged in, show toast and redirect to /login
      toast.info('Please log in to review the company.');
      navigate('/login');
    }
  };

  // Render loading state if singleJob is not yet loaded
  if (!singleJob) {
    return <div className="max-w-7xl mx-auto my-10 p-6">Loading...</div>;
  }

  return (
    <div className=''>
      <Navbar />
      <div className='max-w-7xl mx-auto my-10 px-6'>
        {/* Top Card: Job Overview */}
        <div className='bg-white shadow-lg rounded-lg p-6 mb-6'>
          <h1 className='font-bold text-2xl mb-2'>{singleJob?.title || 'N/A'}</h1>
          <div className='flex flex-wrap items-center gap-2 mb-4'>
            <Badge className='text-green-700 font-bold bg-green-100'>
              {singleJob?.salary ? singleJob.salary.toLocaleString('vi-VN') : 'Thỏa thuận'} VND
            </Badge>
            <Badge className='text-[#F83002] font-bold bg-red-100'>{singleJob?.jobType || 'N/A'}</Badge>
            <Badge className='text-[#7209b7] font-bold bg-purple-100'>
              {singleJob?.experienceLevel ? `${singleJob.experienceLevel} year(s)` : 'N/A'}
            </Badge>
          </div>
          <div className='flex gap-4'>
            <Button
              onClick={isApplied ? null : applyJobHandler}
              disabled={isApplied || !user}
              className={`rounded-lg flex-1 ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              <img src="https://cdn-icons-png.flaticon.com/128/561/561226.png" className='w-[18px] h-[18px] mr-4'/>
              {isApplied ? 'Already Applied' : 'Apply Now'}
            </Button>
            <Button
              variant="outline"
              className='rounded-lg flex-1 border-gray-300 text-gray-700 hover:bg-gray-100'
            >
              <img src="https://cdn-icons-png.flaticon.com/128/4675/4675168.png" className='w-[18px] h-[18px] mr-4'/>
              Save Job
            </Button>
          </div>
        </div>

        {/* Two-Column Layout: Job Details and Company Info */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Left Column: Job Details and General Info */}
          <div className='md:col-span-2'>
            {/* Job Details Card */}
            <div className='bg-white shadow-lg rounded-lg p-6 mb-6'>
              <h1 className='font-bold text-xl border-b-2 border-b-gray-300 pb-2 mb-4'>Job Details</h1>
              <div className='space-y-4'>
                <div>
                  <h2 className='font-bold'>Role:</h2>
                  <p className='pl-4 text-gray-800'>{singleJob?.title || 'N/A'}</p>
                </div>
                <div>
                  <h2 className='font-bold'>Job Description:</h2>
                  <ul className='pl-8 list-disc text-gray-800'>
                    {Array.isArray(singleJob?.description) && singleJob.description.length > 0 ? (
                      singleJob.description.map((desc, index) => (
                        <li key={index}>{desc}</li>
                      ))
                    ) : (
                      <li>No Description</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h2 className='font-bold'>Location:</h2>
                  <p className='pl-4 text-gray-800'>{singleJob?.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* General Information Card */}
            <div className='bg-white shadow-lg rounded-lg p-6'>
              <h1 className='font-bold text-xl border-b-2 border-b-gray-300 pb-2 mb-4'>General Information</h1>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-green-600'>
                    <img src="https://cdn-icons-png.flaticon.com/128/10316/10316527.png" className='w-[40px] h-[40px] mr-4'/>
                  </span>
                  <div>
                    <h2 className='font-bold'>Level:</h2>
                    <p className='text-gray-800'>{singleJob?.level || 'N/A'}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-green-600'>
                    <img src="https://cdn-icons-png.flaticon.com/128/1769/1769059.png" className='w-[40px] h-[40px] mr-4'/>
                  </span>
                  <div>
                    <h2 className='font-bold'>Position(s):</h2>
                    <p className='text-gray-800'>{singleJob?.position || 'N/A'} Person</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-green-600'>
                    <img src="https://cdn-icons-png.flaticon.com/128/639/639343.png" className='w-[40px] h-[40px] mr-4'/>
                  </span>
                  <div>
                    <h2 className='font-bold'>Job Type:</h2>
                    <p className='text-gray-800'>{singleJob?.jobType || 'N/A'}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-green-600'>
                    <img src="https://cdn-icons-png.flaticon.com/128/2838/2838590.png" className='w-[40px] h-[40px] mr-4'/>
                  </span>
                  <div>
                    <h2 className='font-bold'>Working Time:</h2>
                    <p className='text-gray-800'>Contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Company Info */}
          <div className='md:col-span-1'>
            <div className='bg-white shadow-lg rounded-lg p-6 sticky top-6'>
              <h1 className='font-semibold text-xl border-b-2 border-b-gray-300 pb-2 mb-4'>Company</h1>
              {user && companyData ? (
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <img
                      src={companyData.logo || 'https://via.placeholder.com/40'}
                      alt="Company Logo"
                      className='w-10 h-10 rounded-full'
                    />
                    <h2 className='font-bold text-lg line-clamp-2'>{companyData.name || 'N/A'}</h2>
                  </div>
                  <div>
                    <p className='text-gray-600 line-clamp-1 flex flex-row items-center'>
                      <img src="https://cdn-icons-png.flaticon.com/128/9946/9946341.png" className='w-[18px] h-[18px] mr-2'/>
                      Phone: {companyData.contactInfo?.phone || 'N/A'}
                    </p>
                    <p className='text-gray-600 line-clamp-1 flex flex-row items-center'>
                      <img src="https://cdn-icons-png.flaticon.com/128/2642/2642502.png" className='w-[18px] h-[18px] mr-2'/>
                      Location: {companyData.location || 'N/A'}
                    </p>
                    <p className='text-gray-600 mt-2 line-clamp-4'>{companyData.description || 'No description available'}</p>
                  </div>
                  <Button
                    variant="outline"
                    className='w-full border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center'
                    onClick={handleReviewCompany}
                  >
                    <img src="https://cdn-icons-png.flaticon.com/128/455/455792.png" className='w-[18px] h-[18px] mr-2'/>
                    {user ? 'Review Company' : 'Login to Review Company'}
                  </Button>
                </div>
              ) : (
                <p className='text-gray-600 flex flex-row'>Please <a className='font-semibold ml-1 mr-1 text-green-600' href="/login">login</a> to review company info</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;