import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import { motion } from "framer-motion";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";
import { USER_API_END_POINT } from "../utils/constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MyCV = () => {
  const [cvList, setCvList] = useState([]);
  const [file, setFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [isJobSeekingActive, setIsJobSeekingActive] = useState(true);
  const [hoveredCV, setHoveredCV] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${USER_API_END_POINT}/profile`, {
        withCredentials: true,
      });
      console.log("Profile response:", response.data);
      const profile = response.data.user?.profile || {};
      setIsProfilePublic(profile.isPublic || false);
      console.log("isProfilePublic set to:", profile.isPublic || false);
    } catch (error) {
      toast.error("Không thể lấy thông tin profile");
      console.error("Fetch profile error:", error);
    }
  };

  const fetchCVs = async () => {
    try {
      console.log("fetchCVs activated");
      const response = await axios.get(`${USER_API_END_POINT}/cv`, {
        withCredentials: true,
      });
      console.log("CVs response:", response.data);
      setCvList(response.data.cvs || []);
    } catch (error) {
      toast.error("Unable to fetch CV.");
      console.error(error);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      const response = await axios.delete(`${USER_API_END_POINT}/cv/${cvId}`, {
        withCredentials: true,
      });
      toast.success(response.data.message || "Delete CV successfully.");
      fetchCVs();
    } catch (error) {
      toast.error("Delete CV failed.");
      console.error(error);
    }
  };

  const confirmDeleteCV = (cvId) => {
    setCvToDelete(cvId);
    setOpenConfirmDialog(true);
  };

  function makeAsciiOnly(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x00-\x7F]/g, "");
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a CV file.");
      return;
    }

    const safeName = makeAsciiOnly(file.name);
    const normalizedFile = new File([file], safeName, { type: file.type });
    const formData = new FormData();
    formData.append("file", normalizedFile);

    console.log("Uploading CV as:", safeName);

    try {
      const { data } = await axios.post(
        `${USER_API_END_POINT}/cv/upload`,
        formData,
        { withCredentials: true }
      );
      toast.success(data.message || "Upload successfully.");
      fetchCVs();
      setOpenUploadModal(false);
      setFile(null);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Upload failed.");
      } else {
        toast.error("Upload failed.");
      }
      console.error(error);
    }
  };

  const handleSetPrimaryCV = async (cvId) => {
    try {
      const response = await axios.patch(
        `${USER_API_END_POINT}/cv/${cvId}/primary`,
        {},
        { withCredentials: true }
      );
      toast.success("Update primary CV successfully.");
      fetchCVs();
    } catch (error) {
      toast.error("Update primary CV failed.");
      console.error(error);
    }
  };

  const handleUpdateCVTitle = async () => {
    try {
      const response = await axios.patch(
        `${USER_API_END_POINT}/cv/${editingCV._id}`,
        { title: newTitle },
        { withCredentials: true }
      );
      toast.success(response.data.message || "Update successfully.");
      setOpenEditDialog(false);
      fetchCVs();
    } catch (error) {
      toast.error("Update failed.");
      console.error(error);
    }
  };

  const isCVPrimary = (cvId) => {
    const cv = cvList.find((cv) => cv._id === cvId);
    return cv ? cv.isPrimary : false;
  };

  const handleSetProfilePublic = async () => {
    try {
      const response = await axios.patch(
        `${USER_API_END_POINT}/profile/public`,
        {},
        { withCredentials: true }
      );
      await fetchProfile();
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Error updating profile visibility.");
      console.error(error);
    }
  };

  // Fetch job-seeking status from the API
  const checkJobSeekingStatus = async () => {
    try {
      const response = await axios.get(
        `${USER_API_END_POINT}/profile/find-job-status`,
        {
          withCredentials: true,
        }
      );
      const status = response.data?.data?.isFindJob || false; // Access isFindJob from data object
      setIsJobSeekingActive(status); // Set state to match API response
      console.log("Fetched job seeking status:", status);
    } catch (error) {
      toast.error("Error checking job seeking status.");
      console.error("Check job seeking status error:", error);
    }
  };

  // Handle toggle of job-seeking status
  const handleSetJobSeekingStatus = async (checked) => {
    try {
      setIsJobSeekingActive(checked); // Optimistically update state for instant UI feedback
      const response = await axios.patch(
        `${USER_API_END_POINT}/profile/find-job`,
        { isFindJob: checked }, // Send the toggled value
        { withCredentials: true }
      );
      toast.success(
        response.data.message || "Job seeking status updated successfully."
      );
    } catch (error) {
      // Revert state on failure for consistency
      setIsJobSeekingActive(!checked);
      toast.error("Error updating job seeking status.");
      console.error("Job seeking status error:", error);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    console.log("Fetching CVs, profile, and job seeking status...");
    fetchCVs();
    fetchProfile();
    checkJobSeekingStatus();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    console.log("isJobSeekingActive updated:", isJobSeekingActive);
  }, [isJobSeekingActive]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-2xl font-bold mb-4">CV Uploaded</h2>
              <div className="">
                <button
                  onClick={() => setOpenUploadModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-3xl flex flex-row"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/16716/16716256.png"
                    alt="Upload CV"
                    className="w-5 h-5 mr-3 mt-[3px]"
                  />
                  Upload CV
                </button>
              </div>
            </div>
            <div className="text-center mt-16">
              {cvList.length === 0 ? (
                <div>
                  <span className="text-gray-500">No CV uploaded.</span>
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/6818/6818206.png"
                    alt="No CV"
                    className="mt-4 mx-auto w-32 h-32"
                  />
                </div>
              ) : (
                <motion.ul className="grid grid-cols-1 gap-4">
                  {cvList.map((cv) => (
                    <motion.li
                      key={cv._id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-4 rounded-lg shadow relative"
                      style={{
                        backgroundImage: `url('https://cengizkemec.com.tr/wp-content/uploads/2022/03/banner-para-cv.png')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                      onMouseEnter={() => setHoveredCV(cv._id)}
                      onMouseLeave={() => setHoveredCV(null)}
                    >
                      <button
                        onClick={() => handleSetPrimaryCV(cv._id)}
                        className="absolute top-2 right-2 bg-white text-[#3b3b3b] text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 border transition duration-200 hover:bg-[#3b3b3b] group"
                      >
                        {isCVPrimary(cv._id) ? (
                          <>
                            <FontAwesomeIcon
                              icon="star"
                              className="h-4 w-4 text-yellow-500"
                            />
                            <span className="text-[#3b3b3b] group-hover:hidden">
                              Primary CV
                            </span>
                            <span className="text-white hidden group-hover:inline">
                              Unset primary CV
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="transition duration-200 group-hover:text-yellow-500">
                              <FontAwesomeIcon
                                icon="star"
                                className="h-4 w-4"
                              />
                            </span>
                            <span className="transition duration-200 group-hover:text-white">
                              Set primary CV
                            </span>
                          </>
                        )}
                      </button>

                      <div className="flex items-start gap-4">
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/4322/4322991.png"
                          alt="CV avatar"
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex flex-col text-left">
                          <div className="flex flex-row items-center">
                            <a
                              href={cv.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-gray-800 hover:underline"
                            >
                              {cv.resumeOriginalName}
                            </a>
                          </div>
                          <p className="text-sm text-gray-500">
                            Last edit:{" "}
                            {new Date(cv.updatedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}{" "}
                            {new Date(cv.updatedAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          <Dialog.Root
                            open={openEditDialog}
                            onOpenChange={setOpenEditDialog}
                          >
                            <Dialog.Portal>
                              <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                                <Dialog.Title className="sr-only">
                                  Update CV title
                                </Dialog.Title>
                                <h2 className="text-lg font-semibold">
                                  Update CV title
                                </h2>
                                <input
                                  type="text"
                                  className="mt-4 w-full border border-gray-300 rounded p-2"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <div className="flex justify-end mt-4">
                                  <Dialog.Close className="text-gray-500 hover:text-red-500 mr-4">
                                    Cancel
                                  </Dialog.Close>
                                  <button
                                    onClick={handleUpdateCVTitle}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                  >
                                    Update
                                  </button>
                                </div>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>

                          <a
                            onClick={() => {
                              setEditingCV(cv);
                              setNewTitle(cv.resumeOriginalName);
                              setOpenEditDialog(true);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded cursor-pointer"
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/2921/2921222.png"
                              alt="Edit CV"
                              className="w-5 h-5 inline-block mr-1"
                            />
                            Edit
                          </a>

                          <a
                            className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded cursor-pointer"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const response = await fetch(cv.resume);
                                const blob = await response.blob();
                                const handle = await window.showSaveFilePicker({
                                  suggestedName: "resume.pdf",
                                  types: [
                                    {
                                      description: "PDF Files",
                                      accept: { "application/pdf": [".pdf"] },
                                    },
                                  ],
                                });
                                const writable = await handle.createWritable();
                                await writable.write(blob);
                                await writable.close();
                              } catch (err) {
                                if (err.name !== "AbortError") {
                                  console.error("Error saving file:", err);
                                }
                              }
                            }}
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/10741/10741247.png"
                              alt="Download CV"
                              className="w-5 h-5 inline-block mr-1"
                            />
                            Download
                          </a>
                        </div>

                        <Dialog.Root
                          open={openConfirmDialog}
                          onOpenChange={setOpenConfirmDialog}
                        >
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                              <h2 className="text-lg font-semibold">
                                Confirm delete
                              </h2>
                              <p className="mt-2">
                                Are you sure you want to delete this CV?
                              </p>
                              <div className="flex justify-end mt-4">
                                <Dialog.Close className="text-gray-500 hover:text-red-500 mr-4">
                                  Cancel
                                </Dialog.Close>
                                <button
                                  onClick={() => {
                                    handleDeleteCV(cvToDelete);
                                    setOpenConfirmDialog(false);
                                  }}
                                  className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>

                        <button
                          onClick={() => confirmDeleteCV(cv._id)}
                          className="flex items-center p-2 bg-transparent border-none cursor-pointer"
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/128/484/484560.png"
                            alt="Delete CV"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Profile Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {isProfilePublic ? "Public" : "Private"}
              </span>
              <Switch.Root
                checked={isProfilePublic}
                onCheckedChange={handleSetProfilePublic}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-600"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If you set your profile status to public, everyone will be able to
              see your profile.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Find Job Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {isJobSeekingActive ? "Active" : "Inactive"}
              </span>
              <Switch.Root
                checked={isJobSeekingActive}
                onCheckedChange={handleSetJobSeekingStatus}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-600"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If you set your find job status to active, recruiters can find you
              for job opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Upload CV Modal */}
      <Dialog.Root open={openUploadModal} onOpenChange={setOpenUploadModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-green-700">
                      Upload your CV to find work easily.
                    </h2>
                    <p className="text-sm text-gray-600">
                      Reduce up to 50% time to find a hot and suitable job for
                      your career.
                    </p>
                  </div>
                  <img
                    src="https://static.topcv.vn/v4/image/upload-cv/banner_upload.png"
                    alt="Banner"
                    className="absolute right-14 top-1 w-16 h-16"
                  />
                </div>
                <Dialog.Close className="text-gray-500 hover:text-red-500">
                  ✕
                </Dialog.Close>
              </div>

              <div
                className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length > 0) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => document.getElementById("cvInput").click()}
              >
                <p className="text-sm font-bold mb-2">
                  Upload your CV, select or drag the file here.
                </p>
                <input
                  id="cvInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supporting file type .doc, .docx, .pdf under 5MB
                </p>
                {file && (
                  <p className="mt-2 text-green-700 text-sm">
                    Đã chọn: {file.name}
                  </p>
                )}
              </div>

              <button
                onClick={handleUpload}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Upload CV
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/4727/4727424.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Receive the best opportunities
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/18115/18115754.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Tracking data, utilize your CV
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/5685/5685190.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Share your CV to everywhere
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/3437/3437297.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Fast connect with the recruiters
                  </p>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default MyCV;
