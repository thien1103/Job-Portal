import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Contact, Mail } from "lucide-react";
import { Badge } from "../ui/badge";
import companyLogo from "../../assets/company_profile_icon.png";
import educationLogo from "../../assets/education_profile_icon.png";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { USER_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { format } from "date-fns";

const VisitUserPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCV, setLoadingCV] = useState(true);
  const [errorProfile, setErrorProfile] = useState(null);
  const [errorCV, setErrorCV] = useState(null);
  const [retryCountProfile, setRetryCountProfile] = useState(0);
  const [retryCountCV, setRetryCountCV] = useState(0);

  const cvTitleVariants = {
    hover: {
      scale: 1.05,
      color: "#15803d",
      transition: { duration: 0.2 },
    },
  };

  const clearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  const fetchProfile = async (retry = 0) => {
    const maxRetries = 3;
    const retryDelay = 2 ** retry * 1000;

    try {
      setLoadingProfile(true);
      setErrorProfile(null);
      console.log(`Fetching profile for user ID: ${userId} (Retry ${retry})`);
      console.log(
        `Profile endpoint: ${JOB_API_END_POINT}/applications/${userId}`
      );

      const response = await axios.get(
        `${JOB_API_END_POINT}/applications/${userId}`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response.data && response.data.success) {
        setProfile(response.data.user || null);
        console.log("Profile data set:", response.data.user);
      } else {
        console.log("Profile fetch failed: Invalid response format");
        setErrorProfile("Failed to fetch profile: Invalid response");
      }
    } catch (error) {
      console.error("Error fetching profile:", error.message || error);
      if (
        retry < maxRetries &&
        (error.response?.status === 502 || error.code === "ECONNABORTED")
      ) {
        console.log(`Retrying profile fetch in ${retryDelay / 1000}s...`);
        setTimeout(() => fetchProfile(retry + 1), retryDelay);
      } else {
        setErrorProfile(
          error.response?.data?.message ||
            "Failed to fetch profile: Server error"
        );
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCV = async (retry = 0) => {
    const maxRetries = 3;
    const retryDelay = 2 ** retry * 1000;

    try {
      setLoadingCV(true);
      setErrorCV(null);
      console.log(`Fetching CV for user ID: ${userId} (Retry ${retry})`);
      console.log(
        `CV endpoint: ${USER_API_END_POINT}/applicant/${userId}/primary-cv`
      );

      const response = await axios.get(
        `${USER_API_END_POINT}/applicant/${userId}/primary-cv`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response.data && response.data.success) {
        setResumeUrl(response.data);
        console.log("Resume URL set:", response.data);
      } else {
        console.log("CV fetch failed: Invalid response format");
        setErrorCV("Failed to fetch CV: Invalid response");
      }
    } catch (error) {
      console.error("Error fetching CV:", error.message || error);
      if (
        retry < maxRetries &&
        (error.response?.status === 502 || error.code === "ECONNABORTED")
      ) {
        console.log(`Retrying CV fetch in ${retryDelay / 1000}s...`);
        setTimeout(() => fetchCV(retry + 1), retryDelay);
      } else if (error.response?.status === 404) {
        setErrorCV("No CV uploaded");
      } else {
        setErrorCV(
          error.response?.data?.message || "Failed to fetch CV: Server error"
        );
      }
    } finally {
      setLoadingCV(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (userId) {
      setProfile(null);
      setResumeUrl(null);
      setErrorProfile(null);
      setErrorCV(null);
      setRetryCountProfile(0);
      setRetryCountCV(0);
      fetchProfile();
      fetchCV();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loadingProfile || loadingCV) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (errorProfile) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <div className="bg-red-100 rounded-lg p-6 text-center">
          <p>Error fetching profile: {errorProfile}</p>
          <button
            onClick={() => {
              setErrorProfile(null);
              setProfile(null);
              clearCookies();
              fetchProfile();
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <div className="bg-green-100 rounded-lg p-6 text-center">
          <span className="text-gray-500">Profile not found.</span>
          <img
            src="https://cdn-icons-png.flaticon.com/128/11029/11029675.png"
            alt="unpublicProfile"
            className="mt-4 mx-auto w-32 h-32"
          />
        </div>
      </div>
    );
  }

  const {
    fullname,
    email,
    phoneNumber,
    profile: {
      bio,
      skills,
      experience: experiences,
      education: educations,
      isPublic,
    } = {},
  } = profile;

  if (!isPublic) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <div className="bg-green-100 rounded-lg p-6 text-center">
          <span className="text-gray-500">Profile is not public.</span>
          <img
            src="https://cdn-icons-png.flaticon.com/128/11029/11029675.png"
            alt="unpublicProfile"
            className="mt-4 mx-auto w-32 h-32"
          />
        </div>
      </div>
    );
  }

  const formattedExperiences =
    experiences?.map((exp) => ({
      ...exp,
      position: exp.jobTitle,
      startDate: exp.startDate
        ? format(new Date(exp.startDate), "MMM yyyy")
        : "",
      endDate: exp.endDate
        ? format(new Date(exp.endDate), "MMM yyyy")
        : "Present",
    })) || [];

  const formattedEducations =
    educations?.map((edu) => ({
      ...edu,
      university: edu.institution,
      major: edu.degree,
      startYear: edu.startDate ? new Date(edu.startDate).getFullYear() : "",
      endYear: edu.endDate ? new Date(edu.endDate).getFullYear() : "Present",
    })) || [];

  // Split bio by line breaks
  const bioLines = bio ? bio.split("\n").filter((line) => line.trim()) : [];

  return (
    <div className=" h-[180vh]">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8 ">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{fullname}</h1>
              {bioLines.length > 0 ? (
                <div className="text-gray-500">
                  {bioLines.map((line, index) => (
                    <p key={index} className="mb-1">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No bio available</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>(+84) {phoneNumber || "Not provided"}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="my-5">
          <h1 className="font-bold text-lg">Skills:</h1>
          <div className="flex items-center gap-1 flex-wrap">
            {skills?.length ? (
              skills.map((item, index) => <Badge key={index}>{item}</Badge>)
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl my-5 p-4">
          <h1 className="font-bold text-lg">Experience</h1>
          {formattedExperiences.length > 0 ? (
            formattedExperiences.map((exp, index) => (
              <div key={index} className="flex items-center p-4 border-b">
                <img src={companyLogo} alt="icon" className="w-10 h-10" />
                <div className="ml-4">
                  <p className="font-semibold">{exp.company}</p>
                  <p className="text-sm">
                    {exp.position} | {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No experience listed.</p>
          )}
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl my-5 p-4">
          <h1 className="font-bold text-lg">Education</h1>
          {formattedEducations.length > 0 ? (
            formattedEducations.map((edu, index) => (
              <div key={index} className="flex items-center p-4 border-b">
                <img src={educationLogo} alt="icon" className="w-10 h-10" />
                <div className="ml-4">
                  <p className="font-semibold">{edu.university}</p>
                  <p className="text-sm">
                    {edu.major} | {edu.startYear} - {edu.endYear}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No education listed.</p>
          )}
        </div>

        {/* CV Section */}
        <div className="bg-white rounded-lg p-6 shadow mt-5">
          <h2 className="text-2xl font-bold mb-4">CV</h2>
          <div className="text-center mt-4">
            {errorCV === "No CV uploaded" ? (
              <div>
                <span className="text-gray-500">No CV uploaded.</span>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/6818/6818206.png"
                  alt="No CV"
                  className="mt-4 mx-auto w-32 h-32"
                />
              </div>
            ) : errorCV ? (
              <div>
                <span className="text-gray-500">
                  Error fetching CV: {errorCV}
                </span>
                <button
                  onClick={() => {
                    setErrorCV(null);
                    clearCookies();
                    fetchCV();
                  }}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Retry CV
                </button>
              </div>
            ) : resumeUrl?.cv?.resume ? (
              <motion.ul className="grid grid-cols-1 gap-4">
                <motion.li
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
                  <div className="flex items-start gap-4">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4322/4322991.png"
                      alt="CV avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex flex-col text-left">
                      <motion.p
                        className="text-lg font-semibold text-gray-800"
                        whileHover="hover"
                        variants={cvTitleVariants}
                      >
                        {resumeUrl.cv.title || "Resume"}
                      </motion.p>
                      <p className="text-sm text-gray-500">
                        File: {resumeUrl.cv.resumeOriginalName || "resume.pdf"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end items-center gap-2">
                    <a
                      href={resumeUrl.cv.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded cursor-pointer flex items-center"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/1091/1091169.png"
                        alt="View CV"
                        className="w-5 h-5 inline-block mr-1"
                      />
                      View
                    </a>
                  </div>
                </motion.li>
              </motion.ul>
            ) : (
              <div>
                <span className="text-gray-500">No CV uploaded.</span>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/6818/6818206.png"
                  alt="No CV"
                  className="mt-4 mx-auto w-32 h-32"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitUserPage;
