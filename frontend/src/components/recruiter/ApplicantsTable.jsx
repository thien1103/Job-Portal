import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button } from "../ui/button"; // <- Assuming you're using shadcn/ui

const ApplicantsTable = () => {
  const params = useParams();
  const { applicants } = useSelector((store) => store.application);
  const [detailedApplicants, setDetailedApplicants] = useState({});
  const [noApplicants, setNoApplicants] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state to handle fetching process

  const fetchApplicationDetails = async (jobId, applicationId) => {
    try {
      const res = await axios.get(
        `${JOB_API_END_POINT}/${jobId}/applications/${applicationId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setDetailedApplicants((prev) => ({
          ...prev,
          [applicationId]: res.data.application,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch application details.");
      if (error.response?.status === 404) {
        setNoApplicants(true); // Set noApplicants when 404 error occurs
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchApplicantsData = async () => {
      // If there are no applicants, directly set noApplicants to true
      if (applicants?.length === 0) {
        setNoApplicants(true);
        setLoading(false); // Stop loading once we know there are no applicants
      } else {
        // Otherwise, proceed to fetch details for each applicant
        for (const applicant of applicants) {
          if (!detailedApplicants[applicant.applicationId]) {
            await fetchApplicationDetails(params.id, applicant.applicationId);
          }
        }
        setLoading(false); // Stop loading once all applicants have been processed
      }
    };

    fetchApplicantsData();
  }, [applicants, detailedApplicants, params.id]); // Run effect when applicants or detailedApplicants change

  const statusHandler = async (status, id) => {
    try {
      const res = await axios.post(
        `${JOB_API_END_POINT}/status/${id}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setDetailedApplicants((prev) => ({
          ...prev,
          [id]: { ...prev[id], status },
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <span>Loading...</span> {/* You can replace this with a loading spinner */}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent applied users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {noApplicants ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No Applicant Yet
              </TableCell>
            </TableRow>
          ) : (
            applicants?.map((item) => {
              const detailedData = detailedApplicants[item.applicationId] || {};
              const applicant = detailedData.applicant || {};
              const currentStatus = detailedData.status?.toLowerCase();

              return (
                <TableRow key={item.applicationId}>
                  <TableCell>
                    <Link
                      to={`/visit-user/${applicant._id}`}
                      className="text-blue-600 underline hover:text-blue-800 transition"
                    >
                      {applicant.fullname || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>{applicant.email || "N/A"}</TableCell>
                  <TableCell>
                    {detailedData.job?.company?.contactInfo?.phone || "N/A"}
                  </TableCell>
                  <TableCell>
                    {detailedData.resume ? (
                      <a
                        className="text-blue-600 underline"
                        href={detailedData.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open CV
                      </a>
                    ) : (
                      <span>NA</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {detailedData.appliedAt
                      ? formatDate(detailedData.appliedAt)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {currentStatus || "Pending"}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentStatus === "accepted"}
                      onClick={() =>
                        statusHandler("accepted", item.applicationId)
                      }
                      className="justify-center text-center align-center items-center bg-green-400 hover:bg-green-500"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={currentStatus === "rejected"}
                      onClick={() =>
                        statusHandler("rejected", item.applicationId)
                      }
                      className="justify-center text-center align-center items-center"
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicantsTable;
