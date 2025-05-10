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
import { USER_API_END_POINT } from "@/utils/constant";

const VisitUserPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cvTitleVariants = {
    hover: {
      scale: 1.05,
      color: "#15803d",
      transition: { duration: 0.2 },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching profile and CV for user ID: ${userId}`);
        console.log(`Profile endpoint: ${USER_API_END_POINT}/applicant/${userId}/profile`);
        console.log(`CV endpoint: ${USER_API_END_POINT}/applicant/${userId}/primary-cv`);

        const [profileRes, resumeRes] = await Promise.all([
          axios.get(`${USER_API_END_POINT}/applicant/${userId}/profile`, {
            withCredentials: true,
          }),
          axios.get(`${USER_API_END_POINT}/applicant/${userId}/primary-cv`, {
            withCredentials: true,
          }),
        ]);

        console.log('Profile API Response:', profileRes.data);
        console.log('CV API Response:', resumeRes.data);

        if (profileRes.data.success) {
          setProfile(profileRes.data.user);
          console.log('Profile data set:', profileRes.data.user);
        } else {
          console.log('Profile fetch failed: success is false');
          setError('Failed to fetch profile: Success is false');
        }

        if (resumeRes.data.success) {
          setResumeUrl(resumeRes.data);
          console.log('Resume URL set:', resumeRes.data);
        } else {
          console.log('CV fetch failed: success is false or no URL found');
        }
      } catch (error) {
        console.error('Error fetching profile or CV:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Failed to fetch profile or CV');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Profile not found.</p>
      </div>
    );
  }

  const {
    fullname,
    email,
    phoneNumber,
    profile: { bio, skills, experiences, educations } = {},
  } = profile;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
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
              <p>{bio || "No bio available"}</p>
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
            <span>{phoneNumber || "Not provided"}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="my-5">
          <h1>Skills</h1>
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
          {experiences?.length > 0 ? (
            experiences.map((exp, index) => (
              <div key={index} className="flex items-center p-4 border-b">
                <img src={companyLogo} alt="icon" className="w-10 h-10" />
                <div className="ml-4">
                  <p className="font-semibold">{exp.company}</p>
                  <p className="text-sm">
                    {exp.position} | {exp.startDate} - {exp.endDate || "Present"}
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
          {educations?.length > 0 ? (
            educations.map((edu, index) => (
              <div key={index} className="flex items-center p-4 border-b">
                <img src={educationLogo} alt="icon" className="w-10 h-10" />
                <div className="ml-4">
                  <p className="font-semibold">{edu.university}</p>
                  <p className="text-sm">
                    {edu.major} | {edu.startYear} - {edu.endYear || "Present"}
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
            {resumeUrl?.cv?.resume ? (
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
                      <p className="text-sm text-gray-500"> {/* Updated classes */}
                        File: {resumeUrl.cv.resumeOriginalName || "resume.pdf"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end items-center gap-2">
                    <a
                      className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const response = await fetch(resumeUrl.cv.resume);
                          const blob = await response.blob();
                          const handle = await window.showSaveFilePicker({
                            suggestedName: resumeUrl.cv.resumeOriginalName || "resume.pdf",
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