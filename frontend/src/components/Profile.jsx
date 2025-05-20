import React, { useState, useEffect, useRef } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen, Check, Trash } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import axios from "axios";
import companyLogo from "../assets/company_profile_icon.png";
import educationLogo from "../assets/education_profile_icon.png";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/utils/constant";

// BioDialog and ParseCVDialog unchanged (omitted for brevity)
const BioDialog = ({ bio, open, setOpen }) => {
  const formattedBio = bio ? bio.split("\n").filter(line => line.trim() !== "") : ["No bio available"];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Me</DialogTitle>
          <div className="mt-2 space-y-3">
            {formattedBio.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogHeader>
        <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const ParseCVDialog = ({ open, setOpen }) => {
  const [file, setFile] = useState(null);
  const [userProfile, setUserProfile] = useState({ skills: '' });
  const [experiences, setExperiences] = useState([{ company: '', position: '', startDate: '', endDate: 'Present', description: '' }]);
  const [educations, setEducations] = useState([{ university: '', major: '', startYear: '', endYear: 'Present' }]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCV = async () => {
    if (!file) {
      toast.error('Please select a CV file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${USER_API_END_POINT}/profile/update-from-cv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (res.data.success) {
        const { user } = res.data;
        if (!user?.profile?.skills?.length && !user?.profile?.experience?.length && !user?.profile?.education?.length) {
          toast.error('Please provide correct CV file.');
          return;
        }
        setUserProfile({
          skills: user.profile.skills ? user.profile.skills.join(', ') : '',
        });
        const parsedExperiences = user.profile.experience?.length > 0 
          ? user.profile.experience.map(exp => ({
              company: exp.company || '',
              position: exp.jobTitle || '',
              startDate: exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }) : '',
              endDate: exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }) : 'Present',
              description: exp.description || '',
            }))
          : [{ company: '', position: '', startDate: '', endDate: 'Present', description: '' }];
        setExperiences(parsedExperiences);

        const parsedEducations = user.profile.education?.length > 0 
          ? user.profile.education.map(edu => ({
              university: edu.institution || '',
              major: edu.degree || '',
              startYear: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : '',
              endYear: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : 'Present',
            }))
          : [{ university: '', major: '', startYear: '', endYear: 'Present' }];
        setEducations(parsedEducations);
        toast.success('CV parsed successfully!');
      }
    } catch (error) {
      console.error('Error parsing CV:', error);
      toast.error('Failed to parse CV.');
    }
  };

  const confirmUpdate = async () => {
    try {
      await axios.post(`${USER_API_END_POINT}/profile/update`, {
        skills: userProfile.skills.split(',').map(s => s.trim()),
      }, { withCredentials: true });

      const currentExperiences = await axios.get(`${USER_API_END_POINT}/profile/experience`, { withCredentials: true });
      for (const exp of currentExperiences.data.experience) {
        await axios.delete(`${USER_API_END_POINT}/profile/experience/${exp._id}`, { withCredentials: true });
      }
      for (const exp of experiences) {
        const [month, year] = exp.startDate.split("/");
        const startDate = year && month ? `${year}-${month}-01` : null;
        const endDate = exp.endDate === "Present" ? "" : exp.endDate ? `${exp.endDate.split("/")[1]}-${exp.endDate.split("/")[0]}-01` : null;
        if (startDate && exp.company && exp.position) {
          await axios.post(`${USER_API_END_POINT}/profile/experience`, {
            jobTitle: exp.position,
            company: exp.company,
            startDate,
            endDate,
            description: exp.description,
          }, { withCredentials: true });
        }
      }

      const currentEducations = await axios.get(`${USER_API_END_POINT}/profile/education`, { withCredentials: true });
      for (const edu of currentEducations.data.education) {
        await axios.delete(`${USER_API_END_POINT}/profile/education/${edu._id}`, { withCredentials: true });
      }
      for (const edu of educations) {
        const startDate = edu.startYear ? new Date(edu.startYear).toISOString().split("T")[0] : null;
        const endDate = edu.endYear === "Present" ? "" : edu.endYear ? new Date(edu.endYear).toISOString().split("T")[0] : null;
        if (startDate && edu.university && edu.major) {
          await axios.post(`${USER_API_END_POINT}/profile/education`, {
            degree: edu.major,
            institution: edu.university,
            startDate,
            endDate,
          }, { withCredentials: true });
        }
      }

      toast.success('Profile updated successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parse CV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Upload CV</Label>
            <input type="file" onChange={handleFileChange} className="border p-2 rounded w-full" />
            <Button onClick={parseCV} className="mt-2">Parse CV</Button>
          </div>

          <h3 className="font-semibold">User Profile</h3>
          <div>
            <Label>Skills (comma separated)</Label>
            <input
              className="border p-1 rounded w-full"
              value={userProfile.skills}
              onChange={(e) => setUserProfile({ ...userProfile, skills: e.target.value })}
            />
          </div>

          <h3 className="font-semibold">Experiences</h3>
          {experiences.map((exp, index) => (
            <div key={index} className="space-y-2 border p-2 rounded">
              <div>
                <Label>Company</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={exp.company}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[index].company = e.target.value;
                    setExperiences(newExps);
                  }}
                />
              </div>
              <div>
                <Label>Position</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={exp.position}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[index].position = e.target.value;
                    setExperiences(newExps);
                  }}
                />
              </div>
              <div>
                <Label>Start Date (MM/YYYY)</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={exp.startDate}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[index].startDate = e.target.value;
                    setExperiences(newExps);
                  }}
                />
              </div>
              <div>
                <Label>End Date (MM/YYYY or Present)</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={exp.endDate}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[index].endDate = e.target.value;
                    setExperiences(newExps);
                  }}
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="border p-1 rounded w-full resize-none min-h-[90px]"
                  value={exp.description}
                  onChange={(e) => {
                    const newExps = [...experiences];
                    newExps[index].description = e.target.value;
                    setExperiences(newExps);
                  }}
                />
              </div>
            </div>
          ))}

          <h3 className="font-semibold">Educations</h3>
          {educations.map((edu, index) => (
            <div key={index} className="space-y-2 border p-2 rounded">
              <div>
                <Label>University</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={edu.university}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[index].university = e.target.value;
                    setEducations(newEdus);
                  }}
                />
              </div>
              <div>
                <Label>Major</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={edu.major}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[index].major = e.target.value;
                    setEducations(newEdus);
                  }}
                />
              </div>
              <div>
                <Label>Start Year</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={edu.startYear}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[index].startYear = e.target.value;
                    setEducations(newEdus);
                  }}
                />
              </div>
              <div>
                <Label>End Year (or Present)</Label>
                <input
                  className="border p-1 rounded w-full"
                  value={edu.endYear}
                  onChange={(e) => {
                    const newEdus = [...educations];
                    newEdus[index].endYear = e.target.value;
                    setEducations(newEdus);
                  }}
                />
              </div>
            </div>
          ))}

          <Button onClick={confirmUpdate}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [parseCVDialogOpen, setParseCVDialogOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  const formatDate = (input) => {
    const cleaned = input.replace(/[^0-9]/g, "");
    if (cleaned.length >= 6) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 6);
      return `${month}/${year}`;
    }
    return cleaned;
  };

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/profile/experience`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setExperiences(
            res.data.experience.map((exp) => ({
              id: exp._id,
              company: exp.company,
              position: exp.jobTitle,
              startDate: new Date(exp.startDate).toLocaleDateString("en-US", {
                month: "2-digit",
                year: "numeric",
              }),
              endDate: exp.endDate
                ? new Date(exp.endDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Present",
              description: exp.description,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
        toast.error("Failed to fetch experiences.");
      }
    };

    const fetchEducations = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/profile/education`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setEducations(
            res.data.education.map((edu) => ({
              id: edu._id,
              university: edu.institution,
              major: edu.degree,
              startYear: new Date(edu.startDate).getFullYear().toString(),
              endYear: edu.endDate
                ? new Date(edu.endDate).getFullYear().toString()
                : "Present",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching educations:", error);
        toast.error("Failed to fetch educations.");
      }
    };

    fetchExperiences();
    fetchEducations();
  }, []);

  const addExperienceAPI = async (experience) => {
    try {
      const [month, year] = experience.startDate.split("/");
      const startDate = `${year}-${month}-01`;
      const endDate =
        experience.endDate === "Present"
          ? ""
          : `${experience.endDate.split("/")[1]}-${experience.endDate.split("/")[0]}-01`;
      const payload = {
        jobTitle: experience.position,
        company: experience.company,
        startDate,
        endDate,
        description: experience.description || "",
      };
      const res = await axios.post(`${USER_API_END_POINT}/profile/experience`, payload, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Experience added successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error adding experience:", error);
      toast.error("Failed to add experience.");
      throw error;
    }
  };

  const updateExperienceAPI = async (experience) => {
    try {
      const [month, year] = experience.startDate.split("/");
      const startDate = `${year}-${month}-01`;
      const endDate =
        experience.endDate === "Present"
          ? ""
          : `${experience.endDate.split("/")[1]}-${experience.endDate.split("/")[0]}-01`;
      const payload = {
        jobTitle: experience.position,
        company: experience.company,
        startDate,
        endDate,
        description: experience.description || "",
      };
      const res = await axios.patch(
        `${USER_API_END_POINT}/profile/experience/${experience.id}`,
        payload,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Experience updated successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error updating experience:", error);
      toast.error("Failed to update experience.");
      throw error;
    }
  };

  const deleteExperienceAPI = async (experienceId) => {
    try {
      const res = await axios.delete(`${USER_API_END_POINT}/profile/experience/${experienceId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Experience deleted successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience.");
      throw error;
    }
  };

  const addEducationAPI = async (education) => {
    try {
      const payload = {
        degree: education.major,
        institution: education.university,
        startDate: new Date(education.startYear).toISOString().split("T")[0],
        endDate: education.endYear === "Present" ? "" : new Date(education.endYear).toISOString().split("T")[0],
      };
      const res = await axios.post(`${USER_API_END_POINT}/profile/education`, payload, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Education added successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error adding education:", error);
      toast.error("Failed to add education.");
      throw error;
    }
  };

  const updateEducationAPI = async (education) => {
    try {
      const payload = {
        degree: education.major,
        institution: education.university,
        startDate: new Date(education.startYear).toISOString().split("T")[0],
        endDate: education.endYear === "Present" ? "" : new Date(education.endYear).toISOString().split("T")[0],
      };
      const res = await axios.patch(
        `${USER_API_END_POINT}/profile/education/${education.id}`,
        payload,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Education updated successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error updating education:", error);
      toast.error("Failed to update education.");
      throw error;
    }
  };

  const deleteEducationAPI = async (educationId) => {
    try {
      const res = await axios.delete(`${USER_API_END_POINT}/profile/education/${educationId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Education deleted successfully!");
      }
      return res.data;
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education.");
      throw error;
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    if (field === "startDate" || field === "endDate") {
      const formattedValue = formatDate(value);
      updated[index][field] = formattedValue;
    } else {
      updated[index][field] = value;
    }
    setExperiences(updated);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const removeExperience = async (index) => {
    const experienceId = experiences[index].id;
    if (experienceId) {
      await deleteExperienceAPI(experienceId);
    }
    setExperiences((prev) => prev.filter((_, i) => i !== index));
    if (editingExperienceIndex === index) setEditingExperienceIndex(null);
  };

  const removeEducation = async (index) => {
    const educationId = educations[index].id;
    if (educationId) {
      await deleteEducationAPI(educationId);
    }
    setEducations((prev) => prev.filter((_, i) => i !== index));
    if (editingEducationIndex === index) setEditingEducationIndex(null);
  };
  
  const containerRef = useRef(null);
const isDownRef = useRef(false);
const startXRef = useRef(0);
const scrollLeftRef = useRef(0);

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handleMouseDown = (e) => {
    isDownRef.current = true;
    container.classList.add("cursor-grabbing");
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
    container.classList.remove("cursor-grabbing");
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
    container.classList.remove("cursor-grabbing");
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Adjust scroll speed here
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  container.addEventListener("mousedown", handleMouseDown);
  container.addEventListener("mouseleave", handleMouseLeave);
  container.addEventListener("mouseup", handleMouseUp);
  container.addEventListener("mousemove", handleMouseMove);

  return () => {
    container.removeEventListener("mousedown", handleMouseDown);
    container.removeEventListener("mouseleave", handleMouseLeave);
    container.removeEventListener("mouseup", handleMouseUp);
    container.removeEventListener("mousemove", handleMouseMove);
  };
}, []);

  return (
    <div className="h-[160vh]">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
                alt="profile"
              />
            </Avatar>
            <div className="max-w-[600px]">
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
              <div className="flex flex-col items-start gap-2">
                <p className="text-gray-600 line-clamp-2">{user?.profile?.bio}</p>
                {user?.profile?.bio && (
                  <Button
                    variant="link"
                    className="text-gray-600 p-0 h-auto"
                    onClick={() => setBioDialogOpen(true)}
                  >
                    View More
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setOpen(true)} variant="outline">
              <Pen />
            </Button>
            <Button onClick={() => setParseCVDialogOpen(true)} variant="outline">
              Parse CV
            </Button>
          </div>
        </div>

        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>

        <div className="my-5">
          <h1 className="font-bold text-xl">Skills:</h1>
          <div
  ref={containerRef}
  className="flex overflow-x-auto gap-2 p-2 min-h-[40px] whitespace-nowrap hide-scrollbar cursor-grab"
>
  {user?.profile?.skills?.length ? (
    user.profile.skills.map((item, index) => (
      <Badge key={index} className="px-3 py-1 text-sm flex-shrink-0 non-selectable">
        {item}
      </Badge>
    ))
  ) : (
    <span>NA</span>
  )}
</div>

        </div>
      </div>

      {/* Rest of the component unchanged */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
        <h1 className="font-bold text-lg">Experience</h1>
        {experiences.map((exp, index) => (
          <div key={index} className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img src={companyLogo} alt="icon" className="w-10 h-10" />
              <div className="ml-4 w-full">
                {editingExperienceIndex === index ? (
                  <>
                    <Label>Company</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                    />
                    <Label>Position</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, "position", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <Label>Start Date</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>End Date</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                          placeholder="MM/YYYY"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{exp.company}</p>
                    <p className="text-sm">
                      {exp.position} | {exp.startDate} - {exp.endDate}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (editingExperienceIndex === index) {
                    const exp = experiences[index];
                    try {
                      if (exp.id) {
                        const updatedData = await updateExperienceAPI(exp);
                        setExperiences(
                          updatedData.experience.map((e) => ({
                            id: e._id,
                            company: e.company,
                            position: e.jobTitle,
                            startDate: new Date(e.startDate).toLocaleDateString("en-US", {
                              month: "2-digit",
                              year: "numeric",
                            }),
                            endDate: e.endDate
                              ? new Date(e.endDate).toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "Present",
                            description: e.description,
                          }))
                        );
                      } else {
                        const newExp = await addExperienceAPI(exp);
                        setExperiences(
                          newExp.experience.map((e) => ({
                            id: e._id,
                            company: e.company,
                            position: e.jobTitle,
                            startDate: new Date(e.startDate).toLocaleDateString("en-US", {
                              month: "2-digit",
                              year: "numeric",
                            }),
                            endDate: e.endDate
                              ? new Date(e.endDate).toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "Present",
                            description: e.description,
                          }))
                        );
                      }
                      setEditingExperienceIndex(null);
                    } catch (error) {
                      console.error("Error saving experience:", error);
                    }
                  } else {
                    setEditingExperienceIndex(index);
                  }
                }}
              >
                {editingExperienceIndex === index ? <Check /> : <Pen />}
              </Button>
              {editingExperienceIndex === index && (
                <Button variant="destructive" onClick={() => removeExperience(index)}>
                  <Trash />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button
          className="mt-4 flex items-center gap-2"
          onClick={() => {
            setExperiences([
              ...experiences,
              { company: "", position: "", startDate: "", endDate: "Present", description: "" },
            ]);
            setEditingExperienceIndex(experiences.length);
          }}
        >
          + Add Experience
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
        <h1 className="font-bold text-lg">Education</h1>
        {educations.map((edu, index) => (
          <div key={index} className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img src={educationLogo} alt="icon" className="w-10 h-10" />
              <div className="ml-4 w-full">
                {editingEducationIndex === index ? (
                  <>
                    <Label>University</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={edu.university}
                      onChange={(e) => handleEducationChange(index, "university", e.target.value)}
                    />
                    <Label>Major</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(index, "major", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <Label>Start Year</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={edu.startYear}
                          onChange={(e) => handleEducationChange(index, "startYear", e.target.value)}
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>End Year</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={edu.endYear}
                          onChange={(e) => handleEducationChange(index, "endYear", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{edu.university}</p>
                    <p className="text-sm">
                      {edu.major} | {edu.startYear} - {edu.endYear}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (editingEducationIndex === index) {
                    const edu = educations[index];
                    try {
                      if (edu.id) {
                        const updatedData = await updateEducationAPI(edu);
                        setEducations(
                          updatedData.education.map((e) => ({
                            id: e._id,
                            university: e.institution,
                            major: e.degree,
                            startYear: new Date(e.startDate).getFullYear().toString(),
                            endYear: e.endDate
                              ? new Date(e.endDate).getFullYear().toString()
                              : "Present",
                          }))
                        );
                      } else {
                        const newEdu = await addEducationAPI(edu);
                        setEducations(
                          newEdu.education.map((e) => ({
                            id: e._id,
                            university: e.institution,
                            major: e.degree,
                            startYear: new Date(e.startDate).getFullYear().toString(),
                            endYear: e.endDate
                              ? new Date(e.endDate).getFullYear().toString()
                              : "Present",
                          }))
                        );
                      }
                      setEditingEducationIndex(null);
                    } catch (error) {
                      console.error("Error saving education:", error);
                    }
                  } else {
                    setEditingEducationIndex(index);
                  }
                }}
              >
                {editingEducationIndex === index ? <Check /> : <Pen />}
              </Button>
              {editingEducationIndex === index && (
                <Button variant="destructive" onClick={() => removeEducation(index)}>
                  <Trash />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button
          className="mt-4 flex items-center gap-2"
          onClick={() => {
            setEducations([
              ...educations,
              { university: "", major: "", startYear: "", endYear: "Present" },
            ]);
            setEditingEducationIndex(educations.length);
          }}
        >
          + Add Education
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-10 flex flex-col justify-center text-center aligns-center">
        <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
        <AppliedJobTable />
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
      <BioDialog bio={user?.profile?.bio} open={bioDialogOpen} setOpen={setBioDialogOpen} />
      <ParseCVDialog open={parseCVDialogOpen} setOpen={setParseCVDialogOpen} />
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .non-selectable {
          user-select: none; /* Standard */
          -webkit-user-select: none; /* Safari */
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* IE/Edge */
        }
      `}</style>
    </div>
  );
};

export default Profile;