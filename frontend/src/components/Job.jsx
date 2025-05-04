import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth); // Get user from Redux store

  // Log the job data whenever it changes
  useEffect(() => {
    if (job) {
      console.log("Job data from backend:", job);
    }
  }, [job]);

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  // Handle click for save actions, redirect to login if not logged in
  const handleSaveAction = () => {
    if (!user) {
      navigate("/login");
    } else {
      // Placeholder for save functionality (e.g., dispatch an action to save job)
      console.log("Save job:", job?.id);
    }
  };

  return (
<div className="p-5 rounded-md shadow-xl bg-white border border-gray-100 h-[320px] flex flex-col">
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
          onClick={handleSaveAction}
          disabled={!user} // Disable if not logged in
          title={user ? "Save Job" : "Log in to save"}
        >
          <Bookmark />
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
        <p className="text-sm text-gray-600 line-clamp-2">{job?.description}</p>
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
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={() => navigate(`/job/${job?.id}`)} variant="outline">
          Details
        </Button>
        <Button
          className="bg-[#087658]"
          onClick={handleSaveAction}
        >
          Save For Later
        </Button>
      </div>
    </div>
  );
};

export default Job;