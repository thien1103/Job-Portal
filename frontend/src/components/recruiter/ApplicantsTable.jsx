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
import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button } from "../ui/button";

const ApplicantsTable = () => {
  const params = useParams();
  const { applicants } = useSelector((store) => store.application);
  const [detailedApplicants, setDetailedApplicants] = useState({});
  const [noApplicants, setNoApplicants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState({});

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
        setNoApplicants(true);
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
      setLoading(true); // Ensure loading starts as true
      setNoApplicants(false); // Reset noApplicants

      // If applicants is null, undefined, or an empty array, show "No Applicants"
      if (!applicants || applicants.length === 0) {
        setNoApplicants(true);
        setLoading(false);
        return;
      }

      const promises = applicants.map((applicant) => {
        const id = applicant.applicationId;
        if (!detailedApplicants[id]) {
          return fetchApplicationDetails(params.id, id);
        }
        return null;
      });

      await Promise.all(promises.filter(Boolean));
      setLoading(false);
    };

    fetchApplicantsData();
  }, [applicants, params.id]); // Dependencies: applicants and params.id

  const statusHandler = async (status, id) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${id}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh application details to ensure UI reflects the latest status
        await fetchApplicationDetails(params.id, id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <span>Loading...</span>
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
              const currentStatus = detailedData.status?.toLowerCase() || "pending";

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
                    {currentStatus}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    {currentStatus === "pending" ? (
                      <>
                        <Button
                          variant="outline"
                          disabled={statusLoading[item.applicationId]}
                          onClick={() => statusHandler("accepted", item.applicationId)}
                          className="bg-green-500 hover:bg-green-700 hover:text-white text-black"
                        >
                          {statusLoading[item.applicationId] ? "Processing..." : "Accept"}
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={statusLoading[item.applicationId]}
                          onClick={() => statusHandler("rejected", item.applicationId)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {statusLoading[item.applicationId] ? "Processing..." : "Reject"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={currentStatus === "accepted" ? "outline" : "destructive"}
                        disabled={true}
                        className={`${
                          currentStatus === "accepted"
                            ? "bg-green-400 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                      </Button>
                    )}
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