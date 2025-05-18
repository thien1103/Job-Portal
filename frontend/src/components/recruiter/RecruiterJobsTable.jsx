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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";

// Utility to limit concurrent promises
const limitConcurrency = (tasks, limit) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    let active = 0;

    const runTask = () => {
      if (index >= tasks.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < limit && index < tasks.length) {
        active++;
        const currentIndex = index++;
        tasks[currentIndex]()
          .then((result) => {
            results[currentIndex] = { status: "fulfilled", value: result };
          })
          .catch((error) => {
            results[currentIndex] = { status: "rejected", reason: error };
          })
          .finally(() => {
            active--;
            runTask();
          });
      }
    };

    runTask();
  });
};

const RecruiterJobsTable = ({ jobs, loading }) => {
  const { searchJobByText } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch applicant counts for all jobs
  useEffect(() => {
    const fetchApplicantCounts = async () => {
      if (!jobs || jobs.length === 0) return;

      const tasks = jobs.map((job) => async () => {
        try {
          const res = await axios.get(
            `${JOB_API_END_POINT}/${job.id}/applications`,
            { withCredentials: true, timeout: 5000 }
          );
          console.log(`API response for job ${job.id}:`, res.data); // Log full response for debugging
          if (res.data.success) {
            // Check if applications exists and is an array, default to empty array if not
            const applications = Array.isArray(res.data.applications)
              ? res.data.applications
              : [];
            return { jobId: job.id, count: applications.length };
          }
          return { jobId: job.id, count: 0 };
        } catch (error) {
          console.error(
            `Error fetching applicants for job ${job.id}:`,
            error.message,
            error.response?.data
          );
          // Only show toast for non-404 errors
          if (error.response?.status !== 404) {
            toast.error(`Failed to fetch applicants for job ${job.title}`);
          }
          return { jobId: job.id, count: 0 };
        }
      });

      const results = await limitConcurrency(tasks, 3); // Limit to 3 concurrent requests
      const counts = results.reduce((acc, result) => {
        if (result.status === "fulfilled") {
          acc[result.value.jobId] = result.value.count;
        }
        return acc;
      }, {});

      setApplicantCounts(counts);
    };

    fetchApplicantCounts();
  }, [jobs]);

  // Filter jobs based on search
  useEffect(() => {
    const filtered = jobs
      ? jobs.filter((job) => {
          if (!searchJobByText) return true;
          return (
            job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
            job?.company?.name
              ?.toLowerCase()
              .includes(searchJobByText.toLowerCase())
          );
        })
      : [];
    setFilterJobs(filtered);
  }, [jobs, searchJobByText]);

  // Handler to open the delete confirmation dialog
  const deleteJobHandler = (jobId) => {
    setJobToDelete(jobId);
    setOpenDialog(true);
  };

  // Handler to confirm deletion
  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      const res = await axios.delete(`${JOB_API_END_POINT}/post/${jobToDelete}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh the page to update the job list
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    } finally {
      setOpenDialog(false);
      setJobToDelete(null);
    }
  };

  return (
    <Table className="bg-white rounded-full shadow-sm">
      <TableCaption>A list of your recent posted jobs</TableCaption>
      <TableHeader>
        <TableRow className="bg-white hover:bg-gray-50">
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
          <TableRow className="bg-white">
            <TableCell colSpan={10} className="text-center bg-white">
              Loading...
            </TableCell>
          </TableRow>
        ) : filterJobs.length === 0 ? (
          <TableRow className="bg-white">
            <TableCell colSpan={10} className="text-center bg-white">
              No Job Found
            </TableCell>
          </TableRow>
        ) : (
          filterJobs.map((job) => (
            <TableRow key={job.id} className="bg-white hover:bg-gray-50">
              <TableCell className="bg-white">
                <div
                  className="cursor-pointer underline text-blue-600"
                  onClick={() => navigate(`/company/${job.company._id}`)}
                >
                  {job.company?.name}
                </div>
              </TableCell>
              <TableCell className="bg-white">{job.title}</TableCell>
              <TableCell className="bg-white">{job.jobType}</TableCell>
              <TableCell className="bg-white">{job.level}</TableCell>
              <TableCell className="bg-white">{job.location}</TableCell>
              <TableCell className="bg-white">{job.salary.toLocaleString()}₫</TableCell>
              <TableCell className="bg-white">{job.position}</TableCell>
              <TableCell className="bg-white">{job.deadline}</TableCell>
              <TableCell className="bg-white">{job.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right bg-white">
                <Popover>
                  <PopoverTrigger>
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <MoreHorizontal className="w-5 h-5 cursor-pointer" />
                      {applicantCounts[job.id] > 0 && (
                        <div className="absolute -top-2 -right-3 w-4 h-4">
                          <img
                            src="https://img.icons8.com/?size=100&id=2951&format=png"
                            alt="notification"
                            className="w-full h-full object-contain"
                            style={{
                              filter:
                                "invert(19%) sepia(100%) saturate(7456%) hue-rotate(359deg) brightness(103%) contrast(114%)",
                            }}
                          />
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[54%] text-[9px] text-white font-semibold">
                            {applicantCounts[job.id]}
                          </span>
                        </div>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-40">
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
                      <Eye className="w-4 h-4" />
                      <div className="relative flex items-center">
                        <span>Applications</span>
                        {applicantCounts[job.id] > 0 && (
                          <div className="absolute -top-2 -right-4 w-4 h-4">
                            <img
                              src="https://img.icons8.com/?size=100&id=2951&format=png"
                              alt="notification"
                              className="w-full h-full object-contain"
                              style={{
                                filter:
                                  "invert(19%) sepia(100%) saturate(7456%) hue-rotate(359deg) brightness(103%) contrast(114%)",
                              }}
                            />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[50%] text-[9px] text-white font-semibold">
                              {applicantCounts[job.id]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <div
                          onClick={() => deleteJobHandler(job.id)}
                          className="flex items-center gap-2 w-fit cursor-pointer mt-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete the job posting.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              onClick={() => setJobToDelete(null)}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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