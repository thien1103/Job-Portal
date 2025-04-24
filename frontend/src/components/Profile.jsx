import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen, Check, Trash } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      company: "Apps Cyclone",
      position: "IT Intern",
      startDate: "12/2024",
      endDate: "02/2025",
    },
    {
      id: 2,
      company: "Tech Solutions",
      position: "Junior Developer",
      startDate: "06/2023",
      endDate: "11/2024",
    },
  ]);

  const [educations, setEducations] = useState([
    {
      id: 1,
      university: "FPT University",
      major: "Software Engineering",
      startYear: "2020",
      endYear: "2024",
    },
    {
      id: 2,
      university: "National University",
      major: "Information Technology",
      startYear: "2018",
      endYear: "2020",
    },
  ]);

  // API helper functions
  const addExperienceAPI = async (experience) => {
    try {
      const res = await fetch("YOUR_ADD_EXPERIENCE_API", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experience),
      });
      return await res.json();
    } catch (err) {
      console.error("Error adding experience:", err);
    }
  };

  const updateExperienceAPI = async (experience) => {
    try {
      const res = await fetch("YOUR_UPDATE_EXPERIENCE_API", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experience),
      });
      return await res.json();
    } catch (err) {
      console.error("Error updating experience:", err);
    }
  };

  const addEducationAPI = async (education) => {
    try {
      const res = await fetch("YOUR_ADD_EDUCATION_API", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(education),
      });
      return await res.json();
    } catch (err) {
      console.error("Error adding education:", err);
    }
  };

  const updateEducationAPI = async (education) => {
    try {
      const res = await fetch("YOUR_UPDATE_EDUCATION_API", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(education),
      });
      return await res.json();
    } catch (err) {
      console.error("Error updating education:", err);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const removeExperience = (index) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
    if (editingExperienceIndex === index) setEditingExperienceIndex(null);
  };

  const removeEducation = (index) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
    if (editingEducationIndex === index) setEditingEducationIndex(null);
  };

  return (
    <div>
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
            <div>
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} variant="outline">
            <Pen />
          </Button>
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
          <h1>Skills</h1>
          <div className="flex items-center gap-1">
            {user?.profile?.skills?.length ? (
              user.profile.skills.map((item, index) => (
                <Badge key={index}>{item}</Badge>
              ))
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
        <h1 className="font-bold text-lg">Kinh nghiệm</h1>
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 border-b"
          >
            <div className="flex items-center">
              <img
                src="https://www.vhv.rs/dpng/d/598-5982089_icon-blue-company-icon-png-transparent-png.png"
                alt="icon"
                className="w-10 h-10"
              />
              <div className="ml-4 w-full">
                {editingExperienceIndex === index ? (
                  <>
                    <Label>Company</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(index, "company", e.target.value)
                      }
                    />
                    <Label>Position</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={exp.position}
                      onChange={(e) =>
                        handleExperienceChange(index, "position", e.target.value)
                      }
                    />
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <Label>Start Date</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleExperienceChange(index, "startDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>End Date</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={exp.endDate}
                          onChange={(e) =>
                            handleExperienceChange(index, "endDate", e.target.value)
                          }
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
                    if (exp.id) {
                      await updateExperienceAPI(exp);
                    } else {
                      const newExp = await addExperienceAPI(exp);
                      const updated = [...experiences];
                      updated[index] = newExp;
                      setExperiences(updated);
                    }
                    setEditingExperienceIndex(null);
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
            setExperiences([...experiences, { company: "", position: "", startDate: "", endDate: "" }]);
            setEditingExperienceIndex(experiences.length);
          }}
        >
          + Add Experience
        </Button>
      </div>

      {/* Education */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
        <h1 className="font-bold text-lg">Học vấn</h1>
        {educations.map((edu, index) => (
          <div key={index} className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img
                src="https://www.pngkey.com/png/full/131-1311026_graduate-school-icon-university-icon-blue.png"
                alt="icon"
                className="w-10 h-10"
              />
              <div className="ml-4 w-full">
                {editingEducationIndex === index ? (
                  <>
                    <Label>University</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={edu.university}
                      onChange={(e) =>
                        handleEducationChange(index, "university", e.target.value)
                      }
                    />
                    <Label>Major</Label>
                    <input
                      className="border p-1 rounded w-full mb-2"
                      value={edu.major}
                      onChange={(e) =>
                        handleEducationChange(index, "major", e.target.value)
                      }
                    />
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <Label>Start Year</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={edu.startYear}
                          onChange={(e) =>
                            handleEducationChange(index, "startYear", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>End Year</Label>
                        <input
                          className="border p-1 rounded w-full"
                          value={edu.endYear}
                          onChange={(e) =>
                            handleEducationChange(index, "endYear", e.target.value)
                          }
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
                    if (edu.id) {
                      await updateEducationAPI(edu);
                    } else {
                      const newEdu = await addEducationAPI(edu);
                      const updated = [...educations];
                      updated[index] = newEdu;
                      setEducations(updated);
                    }
                    setEditingEducationIndex(null);
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
            setEducations([...educations, { university: "", major: "", startYear: "", endYear: "" }]);
            setEditingEducationIndex(educations.length);
          }}
        >
          + Add Education
        </Button>
      </div>

      {/* Applied Jobs */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-9 mb-9">
        <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
        <AppliedJobTable />
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;


// import React, { useState } from "react";
// import Navbar from "./shared/Navbar";
// import { Avatar, AvatarImage } from "./ui/avatar";
// import { Button } from "./ui/button";
// import { Contact, Mail, Pen, Check, Trash } from "lucide-react";
// import { Badge } from "./ui/badge";
// import { Label } from "./ui/label";
// import AppliedJobTable from "./AppliedJobTable";
// import UpdateProfileDialog from "./UpdateProfileDialog";
// import { useSelector } from "react-redux";
// import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

// const Profile = () => {
//   useGetAppliedJobs();
//   const [open, setOpen] = useState(false);
//   const { user } = useSelector((store) => store.auth);

//   const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
//   const [editingEducationIndex, setEditingEducationIndex] = useState(null);

//   const [experiences, setExperiences] = useState([
//     {
//       company: "Apps Cyclone",
//       position: "IT Intern",
//       startDate: "12/2024",
//       endDate: "02/2025",
//     },
//     {
//       company: "Tech Solutions",
//       position: "Junior Developer",
//       startDate: "06/2023",
//       endDate: "11/2024",
//     },
//   ]);

//   const [educations, setEducations] = useState([
//     {
//       university: "FPT University",
//       major: "Software Engineering",
//       startYear: "2020",
//       endYear: "2024",
//     },
//     {
//       university: "National University",
//       major: "Information Technology",
//       startYear: "2018",
//       endYear: "2020",
//     },
//   ]);

//   const handleExperienceChange = (index, field, value) => {
//     const updated = [...experiences];
//     updated[index][field] = value;
//     setExperiences(updated);
//   };

//   const handleEducationChange = (index, field, value) => {
//     const updated = [...educations];
//     updated[index][field] = value;
//     setEducations(updated);
//   };

//   const removeExperience = (index) => {
//     setExperiences((prev) => prev.filter((_, i) => i !== index));
//     if (editingExperienceIndex === index) setEditingExperienceIndex(null);
//   };

//   const removeEducation = (index) => {
//     setEducations((prev) => prev.filter((_, i) => i !== index));
//     if (editingEducationIndex === index) setEditingEducationIndex(null);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
//         <div className="flex justify-between">
//           <div className="flex items-center gap-4">
//             <Avatar className="h-24 w-24">
//               <AvatarImage
//                 src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
//                 alt="profile"
//               />
//             </Avatar>
//             <div>
//               <h1 className="font-medium text-xl">{user?.fullname}</h1>
//               <p>{user?.profile?.bio}</p>
//             </div>
//           </div>
//           <Button
//             onClick={() => setOpen(true)}
//             className="text-right"
//             variant="outline"
//           >
//             <Pen />
//           </Button>
//         </div>
//         <div className="my-5">
//           <div className="flex items-center gap-3 my-2">
//             <Mail />
//             <span>{user?.email}</span>
//           </div>
//           <div className="flex items-center gap-3 my-2">
//             <Contact />
//             <span>{user?.phoneNumber}</span>
//           </div>
//         </div>
//         <div className="my-5">
//           <h1>Skills</h1>
//           <div className="flex items-center gap-1">
//             {user?.profile?.skills?.length ? (
//               user?.profile?.skills.map((item, index) => (
//                 <Badge key={index}>{item}</Badge>
//               ))
//             ) : (
//               <span>NA</span>
//             )}
//           </div>
//         </div>
      
//       </div>

//       {/* Kinh nghiệm Section */}
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
//         <h1 className="font-bold text-lg">Kinh nghiệm</h1>
//         {experiences.map((exp, index) => (
//           <div
//             key={index}
//             className="flex justify-between items-center p-4 border-b"
//           >
//             <div className="flex items-center">
//               <img
//                 src="https://www.vhv.rs/dpng/d/598-5982089_icon-blue-company-icon-png-transparent-png.png"
//                 alt="icon"
//                 className="w-10 h-10"
//               />
//               <div className="ml-4 w-full">
//                 {editingExperienceIndex === index ? (
//                   <>
//                   <div className="mb-2">
//                     <Label>Company</Label>
//                     <input
//                         className="border p-1 rounded w-full"
//                         value={exp.company}
//                         onChange={(e) =>
//                         handleExperienceChange(index, "company", e.target.value)
//                         }
//                         placeholder="e.g., Google, ABC Corp"
//                     />
//                     </div>


//                     <div className="mb-2">
//                     <Label>Position</Label>
//                     <input
//                       className="border p-1 rounded w-full mb-1"
//                       value={exp.position}
//                       onChange={(e) =>
//                         handleExperienceChange(
//                           index,
//                           "position",
//                           e.target.value
//                         )
//                       }
//                       placeholder="e.g., Fullstack Developer"
//                     />
//                     </div>


//                     <div className="flex gap-2">
//                     <div className="mt-2">
//                     <Label>Start Date  </Label>
//                       <input
//                         className="border p-1 rounded w-1/2"
//                         value={exp.startDate}
//                         onChange={(e) =>
//                           handleExperienceChange(
//                             index,
//                             "startDate",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., 03/2025"
//                       />
//                       </div>

//                       <div className="mt-2">
//                     <Label>End Date  </Label>
//                       <input
//                         className="border p-1 rounded w-1/2"
//                         value={exp.endDate}
//                         onChange={(e) =>
//                           handleExperienceChange(
//                             index,
//                             "endDate",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., 03/2025"
//                       />
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <p className="font-semibold">{exp.company}</p>
//                     <p className="text-sm">
//                       {exp.position} | {exp.startDate} - {exp.endDate}
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() =>
//                   setEditingExperienceIndex(
//                     editingExperienceIndex === index ? null : index
//                   )
//                 }
//               >
//                 {editingExperienceIndex === index ? <Check /> : <Pen />}
//               </Button>
//               {editingExperienceIndex === index && (
//                 <Button
//                   variant="destructive"
//                   onClick={() => removeExperience(index)}
//                 >
//                   <Trash />
//                 </Button>
//               )}
//             </div>
//           </div>
//         ))}
//         <Button
//           className="mt-4 flex items-center gap-2"
//           onClick={() => {
//             setExperiences([
//               ...experiences,
//               { company: "", position: "", startDate: "", endDate: "" },
//             ]);
//             setEditingExperienceIndex(experiences.length);
//           }}
//         >
//          + Add Experience
//         </Button>
//       </div>

//       {/* Học vấn Section */}
// <div className="max-w-4xl mx-auto bg-white rounded-2xl my-5 p-4">
//   <h1 className="font-bold text-lg">Học vấn</h1>
//   {educations.map((edu, index) => (
//     <div
//       key={index}
//       className="flex justify-between items-center p-4 border-b"
//     >
//       <div className="flex items-center">
//         <img
//           src="https://www.pngkey.com/png/full/131-1311026_graduate-school-icon-university-icon-blue.png"
//           alt="icon"
//           className="w-10 h-10"
//         />
//         <div className="ml-4 w-full">
//           {editingEducationIndex === index ? (
//             <>
//               <div className="mb-2">
//                 <Label>University</Label>
//                 <input
//                   className="border p-1 rounded w-full"
//                   value={edu.university}
//                   onChange={(e) =>
//                     handleEducationChange(index, "university", e.target.value)
//                   }
//                   placeholder="e.g., FPT University"
//                 />
//               </div>

//               <div className="mb-2">
//                 <Label>Major</Label>
//                 <input
//                   className="border p-1 rounded w-full"
//                   value={edu.major}
//                   onChange={(e) =>
//                     handleEducationChange(index, "major", e.target.value)
//                   }
//                   placeholder="e.g., Software Engineering"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <div className="mt-2 w-1/2">
//                   <Label>Start Year</Label>
//                   <input
//                     className="border p-1 rounded w-full"
//                     value={edu.startYear}
//                     onChange={(e) =>
//                       handleEducationChange(index, "startYear", e.target.value)
//                     }
//                     placeholder="e.g., 2020"
//                   />
//                 </div>
//                 <div className="mt-2 w-1/2">
//                   <Label>End Year</Label>
//                   <input
//                     className="border p-1 rounded w-full"
//                     value={edu.endYear}
//                     onChange={(e) =>
//                       handleEducationChange(index, "endYear", e.target.value)
//                     }
//                     placeholder="e.g., 2024"
//                   />
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <p className="font-semibold">{edu.university}</p>
//               <p className="text-sm">
//                 {edu.major} | {edu.startYear} - {edu.endYear}
//               </p>
//             </>
//           )}
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <Button
//           variant="outline"
//           onClick={() =>
//             setEditingEducationIndex(
//               editingEducationIndex === index ? null : index
//             )
//           }
//         >
//           {editingEducationIndex === index ? <Check /> : <Pen />}
//         </Button>
//         {editingEducationIndex === index && (
//           <Button
//             variant="destructive"
//             onClick={() => removeEducation(index)}
//           >
//             <Trash />
//           </Button>
//         )}
//       </div>
//     </div>
//   ))}
//   <Button
//     className="mt-4 flex items-center gap-2"
//     onClick={() => {
//       setEducations([
//         ...educations,
//         { university: "", major: "", startYear: "", endYear: "" },
//       ]);
//       setEditingEducationIndex(educations.length);
//     }}
//   >
//     + Add Education
//   </Button>
// </div>


//       {/* Applied Job Section */}
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl mt-9 mb-9">
//         <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
//         <AppliedJobTable />
//       </div>
//       <UpdateProfileDialog open={open} setOpen={setOpen} />
//     </div>
//   );
// };

// export default Profile;


