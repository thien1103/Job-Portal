import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RecruiterJobsTable = ({ jobs, loading, error }) => {
  const { searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState([]); // Initialize with empty array
  const navigate = useNavigate();

  useEffect(() => {
    const filteredJobs = jobs ? jobs.filter((job) => {
      if (!searchJobByText) return true;
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase())
      );
    }) : [];
    setFilterJobs(filteredJobs);
  }, [jobs, searchJobByText]);

  return (
    <Table>
      <TableCaption>A list of your recent posted jobs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : error || filterJobs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center"/>
              {error ? "Error loading jobs" : "No Job Found"}
            </TableRow>
        ) : (
          filterJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div
                  className="cursor-pointer hover:underline hover:text-blue-600"
                  onClick={() => navigate(`/company/${job.company._id}`)}
                >
                  {job?.company?.name}
                </div>
              </TableCell>
              <TableCell>{job?.title}</TableCell>
              <TableCell>{job?.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right cursor-pointer">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div
                      onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                      className="flex items-center gap-2 w-fit cursor-pointer"
                    >
                      <Edit2 className="w-4" />
                      <span>Edit</span>
                    </div>
                    <div
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                      className="flex items-center w-fit gap-2 cursor-pointer mt-2"
                    >
                      <Eye className="w-4" />
                      <span>Applicants</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default RecruiterJobsTable;