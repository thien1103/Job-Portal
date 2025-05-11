import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RecruiterJobsTable = ({ jobs, loading }) => {
  const { searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = jobs
      ? jobs.filter((job) => {
          if (!searchJobByText) return true;
          return (
            job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
            job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
          );
        })
      : [];
    setFilterJobs(filtered);
  }, [jobs, searchJobByText]);

  return (
    <Table>
      <TableCaption>A list of your recent posted jobs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Job Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead>Positions</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : filterJobs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
              No Job Found
            </TableCell>
          </TableRow>
        ) : (
          filterJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div
                  className="cursor-pointer underline text-blue-600"
                  onClick={() => navigate(`/company/${job.company._id}`)}
                >
                  {job.company?.name}
                </div>
              </TableCell>
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.jobType}</TableCell>
              <TableCell>{job.level}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{job.salary.toLocaleString()}₫</TableCell>
              <TableCell>{job.position}</TableCell>
              <TableCell>{job.deadline}</TableCell>
              <TableCell>{job.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger>
                    <MoreHorizontal className="cursor-pointer" />
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
                      onClick={() =>
                        navigate(`/recruiter/jobs/${job.id}/applicants`)
                      }
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