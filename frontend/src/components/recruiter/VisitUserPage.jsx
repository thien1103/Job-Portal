import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Contact, Mail } from "lucide-react";
import { Badge } from "../ui/badge";
import companyLogo from "../../assets/company_profile_icon.png";
import educationLogo from "../../assets/education_profile_icon.png";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const VisitUserPage = () => {
  const { userId } = useParams(); // Assuming the route includes the userId (e.g., /visit-user/:userId)
  const [profileData, setProfileData] = useState(null);
  const [primaryCV, setPrimaryCV] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define animation variants for the CV title
  const cvTitleVariants = {
    hover: {
      scale: 1.05, // Matches the NavItem scale
      color: "#15803d", // Matches hover:text-green-900 (Tailwind green-900)
      transition: { duration: 0.2 }, // Matches NavItem transition duration
    },
  };

  useEffect(() => {
    // Simulate API calls with fake data for userId = "12345"
    const mockProfileData = {
      user: {
        fullname: "Nguyen Van A",
        email: "nguyenvana@example.com",
        phoneNumber: "0901234567",
        profile: {
          bio: "A passionate software developer with 3 years of experience.",
          skills: ["JavaScript", "React", "Node.js", "Python"],
          experiences: [
            {
              company: "Tech Innovations",
              position: "Software Developer",
              startDate: "03/2022",
              endDate: "05/2024",
            },
            {
              company: "StartUp Hub",
              position: "Junior Developer",
              startDate: "06/2021",
              endDate: "02/2022",
            },
          ],
          educations: [
            {
              university: "Hanoi University of Science and Technology",
              major: "Computer Science",
              startYear: "2017",
              endYear: "2021",
            },
            {
              university: "Online Coding Academy",
              major: "Web Development",
              startYear: "2020",
              endYear: "2021",
            },
          ],
        },
      },
      success: true,
    };

    const mockPrimaryCVData = {
      message: "Primary CV retrieved successfully",
      cv: {
        fullname: "Nguyen Van A",
        resume: "https://example.com/resume/nguyenvana.pdf",
        resumeOriginalName: "Software-Developer_Nguyen-Van-A.pdf",
      },
      success: true,
    };

    // Simulate loading delay
    const timer = setTimeout(() => {
      if (userId === "12345") {
        setProfileData(mockProfileData.user);
        setPrimaryCV(mockPrimaryCVData.cv);
      } else {
        setProfileData(null); // Simulate profile not found for other userIds
        setPrimaryCV(null);
      }
      setLoading(false);
    }, 1000); // 1-second delay to mimic API call

    return () => clearTimeout(timer);
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6">
        <p>Profile not found.</p>
      </div>
    );
  }

  const { fullname, email, phoneNumber, profile } = profileData;
  const experiences = profile?.experiences || [];
  const educations = profile?.educations || [];

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
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
              <p>{profile?.bio || "No bio available"}</p>
            </div>
          </div>
        </div>

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

        <div className="my-5">
          <h1>Skills</h1>
          <div className="flex items-center gap-1">
            {profile?.skills?.length ? (
              profile.skills.map((item, index) => <Badge key={index}>{item}</Badge>)
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl my-5 p-4">
          <h1 className="font-bold text-lg">Experience</h1>
          {experiences.length > 0 ? (
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
          {educations.length > 0 ? (
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

        {/* CV Cards */}
        <div className="bg-white rounded-lg p-6 shadow mt-5">
          <h2 className="text-2xl font-bold mb-4">CV</h2>
          <div className="text-center mt-4">
            {primaryCV ? (
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
                  {/* CV avatar and title */}
                  <div className="flex items-start gap-4">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4322/4322991.png"
                      alt="CV avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex flex-col text-left">
                      <div className="flex flex-row items-center">
                        <motion.p
                          href={primaryCV.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-gray-800"
                          whileHover="hover"
                          variants={cvTitleVariants}
                        >
                          {primaryCV.resumeOriginalName}
                        </motion.p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Full Name: {primaryCV.fullname}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex justify-end items-center gap-2">
                    <a
                      href={primaryCV.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-1 rounded cursor-pointer flex items-center"
                      download={primaryCV.resumeOriginalName}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/10741/10741247.png"
                        alt="Download CV"
                        className="w-5 h-5 inline-block mr-1"
                      />
                      Download
                    </a>
                    <a
                      href={primaryCV.resume}
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