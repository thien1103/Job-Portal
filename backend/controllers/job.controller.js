import { Job } from "../models/job.model.js";
import { createError } from "../utils/appError.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";

export const postJob = async (req, res, next) => {
    try {
        const { title, description, requirements, salary, location, jobType,
            experience, position, companyId, deadline, benefits, level } = req.body;
        const userId = req.user._id;

        if (!title || !description || !requirements || !salary || !location || !jobType ||
            !experience || !position || !companyId || !deadline || !benefits || !level) {
            throw createError("All required fields must be provided", 400);
        };

        const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
        if (!validJobTypes.includes(jobType)) {
            throw createError(`Invalid job type. Must be one of: ${validJobTypes.join(", ")}`, 400);
        }

        const validLevels = ['Intern', 'Fresher', 'Junior', 'Middle', 'Senior', 'Manager', 'Director'];
        if (!validLevels.includes(level)) {
            throw createError(`Invalid level. Must be one of: ${validLevels.join(", ")}`, 400);
        }

        if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
            throw createError("Invalid deadline format (use YYYY-MM-DD)", 400);
        }

        const company = await Company.findById(companyId);
        if (!company) {
            throw createError("Company not found", 404);
        }

        if (company.userId.toString() !== userId.toString()) {
            throw createError("You are not authorized to create a job for this company", 403);
        }

        let finalRequirements = [];
        if (Array.isArray(requirements)) {
            finalRequirements = requirements.map(item => item.trim()).filter(item => item);
        } else if (typeof requirements === "string") {
            finalRequirements = [requirements.trim()].filter(item => item);
        } else {
            throw createError("Requirements must be a string or array of strings", 400);
        }

        let finalBenefits = [];
        if (Array.isArray(benefits)) {
            finalBenefits = benefits.map(item => item.trim()).filter(item => item);
        } else if (typeof benefits === "string") {
            finalBenefits = [benefits.trim()].filter(item => item);
        } else {
            throw createError("Benefits must be a string or array of strings", 400);
        }

        let finalDescription;
        if (Array.isArray(description)) {
            finalDescription = description.map(item => item.trim()).filter(item => item).join("\n");
        } else if (typeof description === "string") {
            finalDescription = description;
        } else {
            throw createError("Description must be a string or array of strings", 400);
        }
        if (!finalDescription.trim()) {
            throw createError("Description cannot be empty", 400);
        }


        const job = await Job.create({
            title,
            description: finalDescription,
            requirements: finalRequirements,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId,
            deadline: deadline,
            benefits: finalBenefits,
            level
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job: {
                title: job.title,
                description: job.description.split('\n'),
                requirements: job.requirements,
                salary: job.salary,
                experienceLevel: job.experienceLevel,
                location: job.location,
                jobType: job.jobType,
                position: job.position,
                company: job.company,
                deadline: job.deadline,
                benefits: job.benefits,
                level: job.level,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const updateJob = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;
        const { title, description, requirements, salary, location, jobType,
            experience, position, companyId, deadline, benefits, level } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            throw createError("Job not found", 404);
        }
        if (job.created_by.toString() !== userId.toString()) {
            throw createError("You are not authorized to update this job", 403);
        }

        const company = await Company.findOne({ userId });
        if (!company) {
            throw createError("You have not registered a company", 404);
        }
        if (job.company.toString() !== company._id.toString()) {
            throw createError("You are not authorized to update a job for this company", 403);
        }

        const updateData = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                throw createError("Title must be a non-empty string", 400);
            }
            updateData.title = title;
        }

        if (description !== undefined) {
            if (Array.isArray(description)) {
                updateData.description = description.map(item => item.trim()).filter(item => item).join("\n");
            } else if (typeof description === "string") {
                updateData.description = description;
            } else {
                throw createError("Description must be a string or array of strings", 400);
            }
            if (!updateData.description.trim()) {
                throw createError("Description cannot be empty", 400);
            }
        }

        if (requirements !== undefined) {
            if (Array.isArray(requirements)) {
                updateData.requirements = requirements.map(item => item.trim()).filter(item => item);
            } else if (typeof requirements === "string") {
                updateData.requirements = requirements.split(",").map(item => item.trim()).filter(item => item);
            } else {
                throw createError("Requirements must be a string or array of strings", 400);
            }
        }

        if (salary !== undefined) {
            if (salary !== null && (isNaN(salary) || Number(salary) < 0)) {
                throw createError("Salary must be a non-negative number or null", 400);
            }
            updateData.salary = salary !== null ? Number(salary) : null;
        }

        if (location !== undefined) {
            if (typeof location !== "string" || !location.trim()) {
                throw createError("Location must be a non-empty string", 400);
            }
            updateData.location = location;
        }

        if (jobType !== undefined) {
            const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
            if (!validJobTypes.includes(jobType)) {
                throw createError(`Invalid job type. Must be one of: ${validJobTypes.join(", ")}`, 400);
            }
            updateData.jobType = jobType;
        }

        if (experience !== undefined) {
            if (experience !== null && (isNaN(experience) || Number(experience) < 0)) {
                throw createError("Experience must be a non-negative number or null", 400);
            }
            updateData.experienceLevel = experience !== null ? Number(experience) : null;
        }

        if (position !== undefined) {
            if (position !== null && (isNaN(position) || Number(position) <= 0)) {
                throw createError("Position must be a positive number or null", 400);
            }
            updateData.position = position !== null ? Number(position) : null;
        }

        if (deadline !== undefined) {
            if (deadline) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(deadline)) {
                    throw createError("Deadline must be in YYYY-MM-DD format", 400);
                }
                const [year, month, day] = deadline.split("-").map(Number);
                if (month < 1 || month > 12) {
                    throw createError("Invalid month: must be between 01 and 12", 400);
                }
                if (day < 1 || day > 31) {
                    throw createError("Invalid day: must be between 01 and 31", 400);
                }
                if (year < 1900 || year > 9999) {
                    throw createError("Invalid year: must be between 1900 and 9999", 400);
                }
                const deadlineDate = new Date(deadline);
                if (isNaN(deadlineDate.getTime()) ||
                    deadlineDate.getFullYear() !== year ||
                    deadlineDate.getMonth() + 1 !== month ||
                    deadlineDate.getDate() !== day) {
                    throw createError("Invalid date: please check the day and month", 400);
                }
                updateData.deadline = deadlineDate;
            } else {
                updateData.deadline = null;
            }
        }

        if (benefits !== undefined) {
            if (Array.isArray(benefits)) {
                updateData.benefits = benefits.map(item => item.trim()).filter(item => item);
            } else if (typeof benefits === "string") {
                updateData.benefits = benefits.split(",").map(item => item.trim()).filter(item => item);
            } else {
                throw createError("Benefits must be a string or array of strings", 400);
            }
        }

        if (level !== undefined) {
            const validLevels = ['Intern', 'Fresher', 'Junior', 'Middle', 'Senior', 'Manager', 'Director'];
            if (!validLevels.includes(level)) {
                throw createError(`Invalid level. Must be one of: ${validLevels.join(", ")}`, 400);
            }
            updateData.level = level;
        }

        if (Object.keys(updateData).length === 0) {
            throw createError("No valid fields provided for update", 400);
        }

        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate({
                path: "company",
                select: "name description website location logo contactInfo"
            })
            .select("-created_by -applications");

        if (!updatedJob) {
            throw createError("Failed to update job", 500);
        }

        return res.status(200).json({
            message: "Job updated successfully",
            job: {
                id: updatedJob._id,
                title: updatedJob.title,
                description: updatedJob.description ? updatedJob.description.split("\n") : [],
                requirements: updatedJob.requirements || [],
                salary: updatedJob.salary,
                experienceLevel: updatedJob.experienceLevel,
                location: updatedJob.location,
                jobType: updatedJob.jobType,
                position: updatedJob.position,
                company: updatedJob.company,
                deadline: updatedJob.deadline
                    ? updatedJob.deadline.toISOString().split("T")[0]
                    : null,
                benefits: updatedJob.benefits || [],
                level: updatedJob.level,
                createdAt: updatedJob.createdAt,
                updatedAt: updatedJob.updatedAt
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const deleteJob = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;

        const job = await Job.findById(jobId);
        if (!job) {
            throw createError("Job not found", 404);
        }

        if (job.created_by.toString() !== userId.toString()) {
            throw createError("You are not authorized to delete this job", 403);
        }

        const company = await Company.findOne({ userId });
        if (!company) {
            throw createError("You have not registered a company", 404);
        }

        // Verify the job belongs to the user's company
        if (job.company.toString() !== company._id.toString()) {
            throw createError("You are not authorized to delete a job for this company", 403);
        }

        if (job.applications && job.applications.length > 0) {
            const deletedApplications = await Application.deleteMany({ _id: { $in: job.applications } });
            console.log(`Deleted ${deletedApplications.deletedCount} applications for job ${jobId}`);
        } else {
            console.log(`No applications to delete for job ${jobId}`);
        }

        const updateResult = await User.updateMany(
            { savedJobs: jobId }, 
            { $pull: { savedJobs: jobId } } 
        );
        console.log(`Removed job ${jobId} from savedJobs of ${updateResult.modifiedCount} users`);

        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            message: "Job deleted successfully",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getAllJobs = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query)
            .populate({
                path: "company",
                select: "name description website location logo contactInfo"
            })
            .populate({
                path: "applications",
                select: "_id userId status createdAt"
            })
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            throw createError("No jobs found", 404);
        }

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            title: job.title,
            description: job.description
                ? job.description.split("\n").map(line => line.trim()).filter(line => line)
                : [],
            requirements: job.requirements || [],
            salary: job.salary,
            experienceLevel: job.experienceLevel,
            location: job.location,
            jobType: job.jobType,
            position: job.position,
            company: job.company,
            deadline: job.deadline ? job.deadline.toISOString().split("T")[0] : null,
            benefits: job.benefits || [],
            level: job.level,
            applications: job.applications,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        }));

        return res.status(200).json({
            jobs: formattedJobs,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getJobById = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            throw createError("Jobs not found", 404);
        };

        const descriptionLines = job.description
            ? job.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(200).json({
            job: {
                title: job.title,
                description: descriptionLines,
                requirements: job.requirements,
                salary: job.salary,
                experienceLevel: job.experienceLevel,
                location: job.location,
                jobType: job.jobType,
                position: job.position,
                deadline: job.deadline,
                benefits: job.benefits,
                level: job.level,
                company: job.company,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getRecruiterJobs = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobs = await Job.find({ created_by: userId })
            .populate({
                path: "company",
                select: "name description website location logo contactInfo"
            })
            .populate({
                path: "applications",
                select: "_id userId status createdAt"
            });

        if (!jobs || jobs.length === 0) {
            throw createError("No jobs found for this recruiter", 404);
        }

        const formattedJobs = jobs.map(job => ({
            id: job._id,
            title: job.title,
            description: job.description
                ? job.description.split("\n").map(line => line.trim()).filter(line => line)
                : [],
            requirements: job.requirements || [],
            salary: job.salary,
            experienceLevel: job.experienceLevel,
            location: job.location,
            jobType: job.jobType,
            position: job.position,
            company: job.company,
            deadline: job.deadline ? job.deadline.toISOString().split("T")[0] : null,
            benefits: job.benefits || [],
            level: job.level,
            applications: job.applications,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        }));

        return res.status(200).json({
            jobs: formattedJobs,
            success: true
        })
    } catch (error) {
        next(error);
    }
};

export const getJobApplicants = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;
        if (!jobId) {
            throw createError("Job ID is required", 400);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            throw createError("Job not found", 404);
        }

        const company = await Company.findOne({ userId });
        if (!company || job.company.toString() !== company._id.toString()) {
            throw createError("You are not authorized to view applications for this job", 403);
        }

        const applications = await Application.find({ job: jobId })
            .sort({ createdAt: -1 })
            .populate({
                path: "applicant",
                select: "_id fullname email"
            })
            .populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "name contactInfo"
                }
            });

        if (!applications || applications.length === 0) {
            // throw createError("No applications found for this job", 404);
            const error = createError("No applications found for this job", 404);
            return res.status(200).json({
                message: error.message,
                application: null,
                success: true
            });
        }

        const applicantsFromApplication = applications.map(app => ({
            applicationId: app._id,
            applicant: app.applicant,
            job: {
                title: app.job.title,
                company: {
                    name: app.job.company.name,
                    contactInfo: app.job.company.contactInfo
                }
            }
        }));

        return res.status(200).json({
            message: "Applicants retrieved successfully",
            applications: applicantsFromApplication,
            success: true
        });
    } catch (error) {
        console.log("Error getJobApplicants controller: ", error);
        next(error);
    }
};

export const getApplicationDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { applicationId } = req.params;
        const jobId = req.params.id;

        if (!jobId || !applicationId) {
            throw createError("Job ID and Application ID are required", 400);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            throw createError("Job not found", 404);
        }

        const company = await Company.findOne({ userId });
        if (!company || job.company._id.toString() !== company._id.toString()) {
            throw createError("You are not authorized to view this application", 403);
        }

        const application = await Application.findById(applicationId)
            .populate({
                path: "applicant",
                select: "_id fullname email",
            })
            .populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "_id name contactInfo",
                },
            });

        if (!application) {
            const error = createError("Application not found", 404);
            return res.status(200).json({
                message: error.message,
                application: null,
                success: true
            });
        }

        // if (application.job._id.toString() !== jobId) {
        //     throw createError("This application does not belong to the specified job", 403);
        // }

        const responseData = {
            id: application._id,
            applicant: application.applicant,
            resume: application.resume,
            coverLetter: application.coverLetter
                ? application.coverLetter.split("\n").map((line) => line.trim()).filter((line) => line)
                : [],
            status: application.status,
            appliedAt: application.createdAt,
            updatedAt: application.updatedAt,
            job: {
                title: application.job.title,
                companyId: application.job.company._id,
                company: {
                    _id: application.job.company._id,
                    name: application.job.company.name,
                    contactInfo: application.job.company.contactInfo,
                },
            },
        };

        return res.status(200).json({
            message: "Application details retrieved successfully",
            application: responseData,
            success: true,
        });
    } catch (error) {
        next(error);
      }
};

export const getApplicantDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const applicantId = req.params.id;

        if (!applicantId) {
            throw createError("Job ID and Application ID are required", 400);
        }

        const recruiter = await Company.findOne({ userId }).select("userId");
        if (!recruiter) {
            throw createError("You are not authorized to access applicant details", 403);
        }


        const applicant = await User.findById(applicantId).select("-password");
        if (!applicant) {
            throw createError("Applicant not found", 404);
        }

        // if (!applicant.profile.isPublic) {
        //     throw createError("This applicant's profile is not public", 403);
        // }

        let responseData;
        if (!applicant.profile.isPublic) {
            responseData = {
                _id: applicant._id,
                fullname: applicant.fullname,
                isPublic: false
            };
        } else {
            responseData = applicant.toObject();
            responseData.isPublic = true;
        }

        return res.status(200).json({
            message: applicant.profile.isPublic
                ? "Profile retrieved successfully"
                : "Profile is private, only limited information is available",
            user: responseData,
            success: true
        });
    } catch (error) {
        console.log("Error getApplicantDetails controller: ", error);
        throw createError(error);
    }
};

export const searchJobs = async (req, res, next) => {
    try {
        const { q, location, jobType, level, minSalary, maxSalary } = req.query;

        const query = {};

        // let hasTextSearch = false;
        // if (q) {
        //     try {
        //         query.$text = { $search: q };
        //         hasTextSearch = true;
        //     } catch (e) {
        //         query.$or = [
        //             { title: { $regex: q, $options: "i" } },
        //             { description: { $regex: q, $options: "i" } },
        //             { location: { $regex: q, $options: "i" } },
        //             { requirements: { $regex: q, $options: "i" } },
        //             { benefits: { $regex: q, $options: "i" } }
        //         ];
        //     }
        // }

        if (q) {
            const keyword = q.toLowerCase();
            const keywordVariants = [
                keyword,
                keyword.endsWith("er") ? keyword.slice(0, -2) : `${keyword}er`,
                keyword.endsWith("ment") ? keyword.slice(0, -4) : `${keyword}ment`
            ];

            query.$or = [
                { title: { $regex: keywordVariants.join("|"), $options: "i" } },
                { description: { $regex: keywordVariants.join("|"), $options: "i" } },
                { location: { $regex: keywordVariants.join("|"), $options: "i" } },
                { requirements: { $elemMatch: { $regex: keywordVariants.join("|"), $options: "i" } } },
                { benefits: { $elemMatch: { $regex: keywordVariants.join("|"), $options: "i" } } },
                { jobType: { $regex: keywordVariants.join("|"), $options: "i" } },
                { level: { $regex: keywordVariants.join("|"), $options: "i" } }
            ];
        }

        if (location) {
            query.location = { $regex: new RegExp(location, "i") };
        }

        if (jobType) {
            query.jobType = jobType;
        }

        if (level) {
            query.level = level;
        }

        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) query.salary.$gte = Number(minSalary);
            if (maxSalary) query.salary.$lte = Number(maxSalary);
        }

        const currentDate = new Date();
        if (Job.schema.paths.deadline) {
            query.deadline = { $gte: currentDate };
        }

        console.log("Query: ", query);

        // let jobsQuery = Job.find(query);
        let jobsQuery = Job.find(query).sort({ createdAt: -1 });

        const jobs = await jobsQuery
            .populate("company", "name")
            .select("-__v -applications")
            .lean();

        console.log("Jobs: ", jobs);

        if (jobs.length === 0) {
            throw createError(" No job is found in accordance with your requirements", 404);
        }

        return res.status(200).json({
            message: "Jobs retrieved successfully",
            success: true,
            data: jobs
        });
    } catch (error) {
        console.log("Error in searchJobs: ", error);
        next(error);
    }
};