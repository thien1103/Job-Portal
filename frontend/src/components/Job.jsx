import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { setSavedJobIds } from "@/redux/jobSlice";

const Job = ({ job, isSavedJobsPage, savedJobIds = [] }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [isSaved, setIsSaved] = useState(isSavedJobsPage || savedJobIds.includes(job?.id));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (job) {
      console.log("Job data from backend:", job);
    }
    setIsSaved(isSavedJobsPage || savedJobIds.includes(job?.id));
  }, [job, savedJobIds, isSavedJobsPage]);

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  const handleSaveAction = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/save-job/${job?.id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsSaved(true);
        dispatch(setSavedJobIds([...savedJobIds, job?.id]));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const handleUnsaveAction = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.delete(
        `${USER_API_END_POINT}/unsave-job/${job?.id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsSaved(false);
        dispatch(setSavedJobIds(savedJobIds.filter(id => id !== job?.id)));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast.error(error.response?.data?.message || "Failed to unsave job");
    }
  };

  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100 h-[320px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {daysAgoFunction(job?.createdAt) === 0
              ? "Today"
              : `${daysAgoFunction(job?.createdAt)} days ago`}
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            size="icon"
            onClick={isSaved ? handleUnsaveAction : handleSaveAction}
            disabled={!user}
            title={user ? (isSaved ? "Unsave Job" : "Save Job") : "Log in to save"}
          >
            <Bookmark fill={isSaved ? "#087658" : "none"} stroke={isSaved ? "#087658" : "#000"} />
          </Button>
        </div>

        <div className="flex items-center gap-2 my-2">
          <Button className="p-6" variant="outline" size="icon">
            <Avatar>
              <AvatarImage src={job?.company?.logo} />
            </Avatar>
          </Button>
          <div>
            <h1 className="font-medium text-lg line-clamp-1">
              {job?.company?.name}
            </h1>
            <p className="text-sm text-gray-500">Vietnam</p>
          </div>
        </div>

        <div>
          <h1 className="font-bold text-lg my-2 line-clamp-1">{job?.title}</h1>
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[3rem]">
            {Array.isArray(job?.description)
              ? job.description.join(" ")
              : job?.description}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge className="text-blue-700 font-bold" variant="ghost">
            {job?.position} Positions
          </Badge>
          <Badge className="text-[#F83002] font-bold" variant="ghost">
            {job?.jobType}
          </Badge>
          <Badge className="text-[#7209b7] font-bold line-clamp-1" variant="ghost">
            {job?.salary?.toLocaleString("vi-VN")} VND
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <Button
          className="bg-[#087658] text-white flex-1 mr-2"
          onClick={() => navigate(`/job/${job?.id}`)}
          variant="outline"
        >
          Details
        </Button>
        {isSaved ? (
          <Button
            className="bg-[#065c47] text-white flex-1 ml-2"
            onClick={handleUnsaveAction}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isHovered ? "Unsave Job" : "Job Saved"}
          </Button>
        ) : (
          <Button
            className="bg-[#087658] text-white flex-1 ml-2"
            onClick={handleSaveAction}
            disabled={!user}
          >
            Save For Later
          </Button>
        )}
      </div>
    </div>
  );
};

export default Job;