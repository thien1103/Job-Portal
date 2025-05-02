import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import { motion } from "framer-motion";
import { Switch } from "../components/ui/Switch";
import * as Dialog from "@radix-ui/react-dialog";
import { USER_API_END_POINT } from "../utils/constant";

const MyCV = () => {
  const [cvList, setCvList] = useState([]);
  const [jobSeekingStatus, setJobSeekingStatus] = useState(true);
  const [file, setFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(false); // New state for profile public status

  const fetchCVs = async () => {
    try {
      console.log("fetchCVs activated");
      const response = await axios.get(`${USER_API_END_POINT}/cv`, {
        withCredentials: true,
      });
      console.log(response.data);
      setCvList(response.data.cvs || []);
    } catch (error) {
      toast.error("Không thể tải danh sách CV.");
      console.error(error);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      const response = await axios.delete(`${USER_API_END_POINT}/cv/${cvId}`, {
        withCredentials: true,
      });
      toast.success(response.data.message || "Xóa CV thành công");
      fetchCVs(); // Refresh list after deletion
    } catch (error) {
      toast.error("Xóa CV thất bại.");
      console.error(error);
    }
  };

  const confirmDeleteCV = (cvId) => {
    setCvToDelete(cvId);
    setOpenConfirmDialog(true);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Vui lòng chọn file CV.");
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await axios.post(
        `${USER_API_END_POINT}/cv/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Tải lên thành công");
      fetchCVs();
      setOpenUploadModal(false);
      setFile(null); // Clear selected file after successful upload
    } catch (error) {
      toast.error("Tải lên thất bại.");
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
      toast.success("Cập nhật CV chính thành công");
      fetchCVs(); // Refresh the CV list to reflect the change
    } catch (error) {
      toast.error("Cập nhật CV chính thất bại.");
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
      toast.success(response.data.message || "Cập nhật thành công");
      setOpenEditDialog(false);
      fetchCVs();
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.error(error);
    }
  };

  // New handler to check if a CV is primary
  const isCVPrimary = (cvId) => {
    const cv = cvList.find((cv) => cv._id === cvId);
    return cv ? cv.isPrimary : false;
  };

  // New handler to set profile public/private
  const handleSetProfilePublic = async () => {
    try {
      const response = await axios.patch(
        `${USER_API_END_POINT}/profile/public`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsProfilePublic(!isProfilePublic); // Toggle the state
    } catch (error) {
      toast.error("Cập nhật trạng thái hồ sơ thất bại.");
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("Fetching CVs...");
    fetchCVs();
    // Note: Add a fetch for initial profile public status if API provides it
    // e.g., axios.get(`${USER_API_END_POINT}/profile`, { withCredentials: true })
    // .then(response => setIsProfilePublic(response.data.isPublic))
    // .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-2xl font-bold mb-4">CV đã upload</h2>
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
                  Tải CV lên
                </button>
              </div>
            </div>
            <div className="text-center mt-16">
              {cvList.length === 0 ? (
                <div>
                  <span className="text-gray-500">
                    Chưa có CV nào được tải lên.
                  </span>
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
                    >
                      {/* Button to set Primary CV */}
                      <button
                        onClick={() => handleSetPrimaryCV(cv._id)}
                        className="absolute top-2 right-2 bg-white text-black text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 border transition duration-200 hover:bg-black hover:text-white"
                      >
                        <span className="transition duration-200 group-hover:text-yellow-900">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </span>
                        Đặt làm CV chính
                      </button>

                      {/* CV avatar and title */}
                      <div className="flex items-start gap-4">
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/4322/4322991.png"
                          alt="CV avatar"
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex flex-col text-left">
                          <div className="flex flex-row items-center">
                            <p className="text-lg font-semibold text-gray-800">
                              {cv.resumeOriginalName}
                            </p>
                            {/* Is Primary CV badge */}
                            {isCVPrimary(cv._id) && (
                              <span className="text-yellow-500 text-xl ml-4">
                                ⭐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Cập nhật lần cuối{" "}
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

                      {/* Action buttons */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          {/* Update Dialog */}
                          <Dialog.Root
                            open={openEditDialog}
                            onOpenChange={setOpenEditDialog}
                          >
                            <Dialog.Portal>
                              <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                                <Dialog.Title className="sr-only">
                                  Cập nhật tiêu đề CV
                                </Dialog.Title>
                                <h2 className="text-lg font-semibold">
                                  Cập nhật tiêu đề CV
                                </h2>
                                <input
                                  type="text"
                                  className="mt-4 w-full border border-gray-300 rounded p-2"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <div className="flex justify-end mt-4">
                                  <Dialog.Close className="text-gray-500 hover:text-red-500 mr-4">
                                    Hủy
                                  </Dialog.Close>
                                  <button
                                    onClick={handleUpdateCVTitle}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                  >
                                    Cập nhật
                                  </button>
                                </div>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>

                          {/* Update Button */}
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
                            Chỉnh sửa
                          </a>

                          <a
                            href={cv.resume}
                            download
                            className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded"
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/10741/10741247.png"
                              alt="Download CV"
                              className="w-5 h-5 inline-block mr-1"
                            />
                            Tải xuống
                          </a>
                        </div>

                        {/* Delete dialog */}
                        <Dialog.Root
                          open={openConfirmDialog}
                          onOpenChange={setOpenConfirmDialog}
                        >
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
                            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                              <h2 className="text-lg font-semibold">
                                Xác nhận xóa
                              </h2>
                              <p className="mt-2">
                                Bạn có chắc chắn muốn xóa CV này không?
                              </p>
                              <div className="flex justify-end mt-4">
                                <Dialog.Close className="text-gray-500 hover:text-red-500 mr-4">
                                  Hủy
                                </Dialog.Close>
                                <button
                                  onClick={() => {
                                    handleDeleteCV(cvToDelete);
                                    setOpenConfirmDialog(false);
                                  }}
                                  className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                  Xóa
                                </button>
                              </div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>

                        {/* Delete button */}
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
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {/* <h3 className="font-bold text-gray-800 mb-2">Trạng thái tìm việc</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {jobSeekingStatus ? "Đang bật" : "Đang tắt"}
            </span>
            <Switch
              checked={jobSeekingStatus}
              onCheckedChange={setJobSeekingStatus}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nếu bạn tắt, nhà tuyển dụng sẽ không thể liên hệ với bạn qua hồ sơ.
          </p> */}

          <h3 className="font-bold text-gray-800 mt-4 mb-2">Trạng thái hồ sơ</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {isProfilePublic ?  "Riêng tư" : "Công khai"}
            </span>
            <Switch
              checked={!isProfilePublic}
              onCheckedChange={handleSetProfilePublic}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nếu bạn đặt thành công khai, hồ sơ của bạn sẽ hiển thị cho mọi người.
          </p>
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
                      Upload CV để các cơ hội việc làm tự tìm đến bạn
                    </h2>
                    <p className="text-sm text-gray-600">
                      Giảm đến 50% thời gian cần thiết để tìm được một công việc
                      phù hợp.
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
                  Tải CV lên từ máy tính, chọn hoặc kéo thả
                </p>
                <input
                  id="cvInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Hỗ trợ định dạng .doc, .docx, .pdf dưới 5MB
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
                Tải CV lên
              </button>

              {/* Four Blocks Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/4727/4727424.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Nhận về các cơ hội tốt nhất
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/18115/18115754.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Theo dõi số liệu, tối ưu CV
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/5685/5685190.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Chia sẻ CV bất cứ nơi đâu
                  </p>
                </div>
                <div className="border border-gray-300 bg-white p-4 rounded-lg flex flex-col items-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/3437/3437297.png"
                    alt="icon"
                    className="mb-2 w-[30%]"
                  />
                  <p className="text-center font-semibold">
                    Kết nối nhanh chóng với nhà tuyển dụng
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