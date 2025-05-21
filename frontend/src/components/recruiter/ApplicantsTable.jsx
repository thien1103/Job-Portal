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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";


const ApplicantsTable = () => {
  const params = useParams();
  const [applicants, setApplicants] = useState([]);
  const [detailedApplicants, setDetailedApplicants] = useState({});
  const [noApplicants, setNoApplicants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState({});
  const [selectedCoverLetter, setSelectedCoverLetter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      return true; // Trả về true khi thành công
    } catch (error) {
      toast.error("Failed to fetch application details.");
      return false; // Trả về false nếu có lỗi
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setNoApplicants(false);

        // Bước 1: Fetch danh sách applicants
        const applicantsResponse = await axios.get(
          `${JOB_API_END_POINT}/${params.id}/applications`,
          { withCredentials: true }
        );

        if (
          !applicantsResponse.data.success ||
          !applicantsResponse.data.applications?.length
        ) {
          setNoApplicants(true);
          return;
        }

        const apps = applicantsResponse.data.applications;
        setApplicants(apps);

        // Bước 2: Fetch chi tiết cho từng applicant
        const detailPromises = apps.map((app) =>
          fetchApplicationDetails(params.id, app.applicationId)
        );

        // Chờ tất cả các promise hoàn thành
        const results = await Promise.all(detailPromises);
        
        // Kiểm tra nếu có bất kỳ request nào thất bại
        const hasErrors = results.some((success) => !success);
        if (hasErrors) {
          toast.error("Some details failed to load");
        }
      } catch (error) {
        toast.error("Failed to fetch applicants data");
        setNoApplicants(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [params.id]);

    const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${date.getFullYear()}`;
  };
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
            <TableHead>Cover Letter</TableHead>
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
                      {applicant.fullname || "No CV"}
                    </Link>
                  </TableCell>
                  <TableCell>{applicant.email || "No cover letter"}</TableCell>
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
                    {detailedData.coverLetter?.length > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedCoverLetter(detailedData.coverLetter.join("\n"));
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 underline hover:text-blue-800 transition cursor-pointer"
                      >
                        Open Cover Letter
                      </button>
                    ) : (
                      "No cover letter"
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
            {/* Cover Letter Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent  className="top-[30%]">
          <DialogHeader>
            <DialogTitle>Cover Letter Content</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
            {selectedCoverLetter || "No cover letter content available"}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsTable;