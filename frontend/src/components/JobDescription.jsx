import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, COMPANY_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !jobId) return;
      setIsChecking(true);
      try {
        const res = await axios.post(
          `${APPLICATION_API_END_POINT}/check/${jobId}`,
          {},
          { withCredentials: true }
        );
        if (res.data.success) {
          setIsApplied(res.data.hasApplied);
        }
      } catch (error) {
        console.error("Error checking application status:", error.response?.data || error.message);
        toast.error("Failed to check application status.");
      } finally {
        setIsChecking(false);
      }
    };

    checkApplicationStatus();
  }, [jobId, user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0] || (event.dataTransfer && event.dataTransfer.files[0]);
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      setCvFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event);
  };

  const removeFile = () => {
    setCvFile(null);
  };

  const applyJobHandler = async () => {
    if (!user) {
      toast.info("Please log in to apply for this job.");
      navigate("/login");
      return;
    }

    if (!cvFile) {
      toast.error("Please upload a CV file.");
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please provide a cover letter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("coverLetter", coverLetter);

      console.log("Sending request to:", `${APPLICATION_API_END_POINT}/apply/${jobId}`);
      console.log("Cookies:", document.cookie);
      const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          applications: [...(singleJob?.applications || []), { applicant: user._id }],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
        setOpenDialog(false);
        setCvFile(null);
        setCoverLetter("");
      }
    } catch (error) {
      console.error("Error applying for job:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to apply for the job.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/${jobId}`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details.");
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (user && singleJob?.company) {
        try {
          const res = await axios.get(`${COMPANY_API_END_POINT}/${singleJob.company}`, { withCredentials: true });
          if (res.data.success) {
            setCompanyData(res.data.company);
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
          toast.error("Failed to load company information.");
        }
      }
    };
    fetchCompanyData();
  }, [user, singleJob]);

  const handleReviewCompany = () => {
    if (user) {
      navigate(`/company/${singleJob.company}`);
    } else {
      toast.info("Please log in to review the company.");
      navigate("/login");
    }
  };

  if (!singleJob) {
    return <div className="max-w-7xl mx-auto my-10 p-6">Loading...</div>;
  }

  return (
    <div className="">
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 px-6">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="font-bold text-2xl mb-2">{singleJob?.title || "N/A"}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="text-green-700 font-bold bg-green-100">
              {singleJob?.salary ? singleJob.salary.toLocaleString("vi-VN") : "Thỏa thuận"} VND
            </Badge>
            <Badge className="text-[#F83002] font-bold bg-red-100">{singleJob?.jobType || "N/A"}</Badge>
            <Badge className="text-[#7209b7] font-bold bg-purple-100">
              {singleJob?.experienceLevel ? `${singleJob.experienceLevel} year(s)` : "N/A"}
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setOpenDialog(true)}
              disabled={isChecking || isApplied}
              className={`rounded-lg flex-1 ${
                isChecking ? "bg-gray-500 cursor-not-allowed" :
                isApplied ? "bg-gray-600 cursor-not-allowed" :
                "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <img src="https://cdn-icons-png.flaticon.com/128/561/561226.png" className="w-[18px] h-[18px] mr-4" alt="Apply Icon" />
              {isChecking ? "Checking..." : isApplied ? "Already Applied" : "Apply Now"}
            </Button>
            <Button
              variant="outline"
              className="rounded-lg flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <img src="https://cdn-icons-png.flaticon.com/128/4675/4675168.png" className="w-[18px] h-[18px] mr-4" alt="Save Icon" />
              Save Job
            </Button>
          </div>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply for {singleJob?.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {cvFile ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 max-w-[200px] truncate">{cvFile.name}</p>
                    <Button variant="destructive" size="sm" onClick={removeFile}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label htmlFor="cv-upload" className="cursor-pointer">
                      Drag & drop your CV here or click to upload (PDF only)
                    </Label>
                    <Input
                      id="cv-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden max-w-[200px]"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cover-letter">Cover Letter</Label>
                <Input
                  id="cover-letter"
                  placeholder="Write your cover letter here..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={applyJobHandler} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h1 className="font-bold text-xl border-b-2 border-b-gray-300 pb-2 mb-4">Job Details</h1>
              <div className="space-y-4">
                <div>
                  <h2 className="font-bold">Role:</h2>
                  <p className="pl-4 text-gray-800">{singleJob?.title || "N/A"}</p>
                </div>
                <div>
                  <h2 className="font-bold">Job Description:</h2>
                  <ul className="pl-8 list-disc text-gray-800">
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
                  <h2 className="font-bold">Location:</h2>
                  <p className="pl-4 text-gray-800">{singleJob?.location || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
              <h1 className="font-bold text-xl border-b-2 border-b-gray-300 pb-2 mb-4">General Information</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    <img src="https://cdn-icons-png.flaticon.com/128/10316/10316527.png" className="w-[40px] h-[40px] mr-4" alt="Level Icon" />
                  </span>
                  <div>
                    <h2 className="font-bold">Level:</h2>
                    <p className="text-gray-800">{singleJob?.level || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    <img src="https://cdn-icons-png.flaticon.com/128/1769/1769059.png" className="w-[40px] h-[40px] mr-4" alt="Position Icon" />
                  </span>
                  <div>
                    <h2 className="font-bold">Position(s):</h2>
                    <p className="text-gray-800">{singleJob?.position || "N/A"} Person</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    <img src="https://cdn-icons-png.flaticon.com/128/639/639343.png" className="w-[40px] h-[40px] mr-4" alt="Job Type Icon" />
                  </span>
                  <div>
                    <h2 className="font-bold">Job Type:</h2>
                    <p className="text-gray-800">{singleJob?.jobType || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    <img src="https://cdn-icons-png.flaticon.com/128/2838/2838590.png" className="w-[40px] h-[40px] mr-4" alt="Working Time Icon" />
                  </span>
                  <div>
                    <h2 className="font-bold">Working Time:</h2>
                    <p className="text-gray-800">Contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-6">
              <h1 className="font-semibold text-xl border-b-2 border-b-gray-300 pb-2 mb-4">Company</h1>
              {user && companyData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={companyData.logo || "https://via.placeholder.com/40"}
                      alt="Company Logo"
                      className="w-10 h-10 rounded-full"
                    />
                    <h2 className="font-bold text-lg line-clamp-2">{companyData.name || "N/A"}</h2>
                  </div>
                  <div>
                    <p className="text-gray-600 line-clamp-1 flex flex-row items-center">
                      <img src="https://cdn-icons-png.flaticon.com/128/9946/9946341.png" className="w-[18px] h-[18px] mr-2" alt="Phone Icon" />
                      Phone: {companyData.contactInfo?.phone || "N/A"}
                    </p>
                    <p className="text-gray-600 line-clamp-1 flex flex-row items-center">
                      <img src="https://cdn-icons-png.flaticon.com/128/2642/2642502.png" className="w-[18px] h-[18px] mr-2" alt="Location Icon" />
                      Location: {companyData.location || "N/A"}
                    </p>
                    <p className="text-gray-600 mt-2 line-clamp-4">{companyData.description || "No description available"}</p>
                    <p>
                      Website: <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{companyData.website}</a>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                    onClick={handleReviewCompany}
                  >
                    <img src="https://cdn-icons-png.flaticon.com/128/455/455792.png" className="w-[18px] h-[18px] mr-2" alt="Review Icon" />
                    {user ? "Review Company" : "Login to Review Company"}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600 flex flex-row">
                  Please <a className="font-semibold ml-1 mr-1 text-green-600" href="/login">login</a> to review company info
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;