import { Job } from "../models/job.model.js";
import { createError } from "../utils/appError.js";

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
            throw createError("Invalid job type. Must be one of: " + validJobTypes.join(", "), 400);

        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        if (company.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to create a job for this company.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId,
            deadline: new Date(deadline),
            benefits: benefits ? benefits.split(",") : [],
            level
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
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
        const jobs = await Job.find(query).populate({
            path: "company",
        }).sort({ createdAt: -1 });
        if (!jobs) {
            throw createError("Jobs not found", 404);
        };
        return res.status(200).json({
            jobs,
            success: true
        })
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
        return res.status(200).json({
            job: {
                title: job.title,
                description: job.description,
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

export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
