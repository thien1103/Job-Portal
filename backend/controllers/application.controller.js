import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { createError } from "../utils/appError.js";
import { Company } from "../models/company.model.js";
import { sendEmail } from "../middlewares/nodemailer.js";

import getDataUri from "../utils/datauri.js";
import cloudinary from "../configs/cloudinary.js";

export const applyJob = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;
        const file = req.file;
        const { coverLetter } = req.body;
        if (!jobId) {
            throw createError("Job ID is required", 400);
        };

        const job = await Job.findById(jobId);
        if (!job) {
            throw createError("Job not found", 404);
        }

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            throw createError("You have already applied for this job", 400);
        }

        if (!file) {
            throw createError("PDF file is required", 400);
        }

        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: "raw",
        });

        let finalCoverLetter = "";
        if (coverLetter) {
            if (Array.isArray(coverLetter)) {
                finalCoverLetter = coverLetter.map(item => item.trim()).filter(item => item).join("\n");
            } else if (typeof coverLetter === "string") {
                finalCoverLetter = coverLetter;
            } else {
                throw createError("Cover letter must be a string or array of strings", 400);
            }
        }

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            resume: cloudResponse.secure_url,
            coverLetter: finalCoverLetter,
            status: "pending"
        });

        job.applications.push(newApplication._id);
        await job.save();

        const populatedApplication = await Application.findById(newApplication._id)
            .populate({
                path: "job",
                select: "title description requirements company",
                populate: {
                    path: "company",
                    select: "name description website location logo contactInfo"
                }
            });

        const coverLetterLines = populatedApplication.coverLetter
            ? populatedApplication.coverLetter.split("\n").map(line => line.trim()).filter(line => line)
            : [];
        const jobDescriptionLines = populatedApplication.job.description
            ? populatedApplication.job.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];
        const companyDescriptionLines = populatedApplication.job.company.description
            ? populatedApplication.job.company.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(201).json({
            message: "Job applied successfully",
            application: {
                id: populatedApplication._id,
                job: {
                    ...populatedApplication.job._doc,
                    description: jobDescriptionLines,
                    company: {
                        ...populatedApplication.job.company._doc,
                        description: companyDescriptionLines
                    },
                },
                applicant: populatedApplication.applicant,
                resume: populatedApplication.resume,
                coverLetter: coverLetterLines,
                status: populatedApplication.status,
                createdAt: populatedApplication.createdAt,
                updatedAt: populatedApplication.updatedAt
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getAppliedJobs = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                select: "title description requirements company salary experienceLevel location jobType position deadline benefits level",
                populate: {
                    path: "company",
                    select: "name description website location logo contactInfo"
                }
            });

        if (!applications || applications.length === 0) {
            throw createError("No applications found", 404);
        }

        const formattedApplications = applications.map(app => ({
            id: app._id,
            job: {
                ...app.job._doc,
                description: app.job.description
                    ? app.job.description.split("\n").map(line => line.trim()).filter(line => line)
                    : [],
                company: {
                    ...app.job.company._doc,
                    description: app.job.company.description
                        ? app.job.company.description.split("\n").map(line => line.trim()).filter(line => line)
                        : []
                },
                deadline: app.job.deadline ? app.job.deadline.toISOString().split("T")[0] : null
            },
            applicant: app.applicant,
            resume: app.resume,
            coverLetter: app.coverLetter
                ? app.coverLetter.split("\n").map(line => line.trim()).filter(line => line)
                : [],
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
        }));

        return res.status(200).json({
            message: "Applied jobs retrieve successfully",
            applications: formattedApplications,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicants = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;

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
                select: "name email"
            })
            .populate({
                path: "job",
                select: "title description requirements company salary experienceLevel location jobType position deadline benefits level",
                populate: {
                    path: "company",
                    select: "name description website location logo contactInfo"
                }
            });

        if (!applications || applications.length === 0) {
            throw createError("No applications found for this job", 404);
        }

        const formattedApplications = applications.map(app => ({
            id: app._id,
            job: {
                ...app.job._doc,
                description: app.job.description
                    ? app.job.description.split("\n").map(line => line.trim()).filter(line => line)
                    : [],
                company: {
                    ...app.job.company._doc,
                    description: app.job.company.description
                        ? app.job.company.description.split("\n").map(line => line.trim()).filter(line => line)
                        : []
                },
                deadline: app.job.deadline ? app.job.deadline.toISOString().split("T")[0] : null
            },
            applicant: app.applicant,
            resume: app.resume,
            coverLetter: app.coverLetter
                ? app.coverLetter.split("\n").map(line => line.trim()).filter(line => line)
                : [],
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt
        }));

        return res.status(200).json({
            applications: formattedApplications,
            success: true
        });
    } catch (error) {
        next(error);
    }
}
export const updateStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const applicationId = req.params.id;
        const { status } = req.body;

        const validStatuses = ["pending", "accepted", "rejected"];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            throw createError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
        }

        const application = await Application.findById(applicationId).populate({
            path: "applicant",
            select: "fullname email"
        });
        if (!application) {
            throw createError("Application not found", 404);
        }

        const job = await Job.findById(application.job).populate({
            path: "company",
            select: "userId name"
        });
        if (!job) {
            throw createError("Job not found", 404);
        }

        const company = await Company.findOne({ userId });
        if (!company || job.company.toString() !== company._id.toString()) {
            throw createError("You are not authorized to update this application", 403);
        }

        const newStatus = status.toLowerCase();
        application.status = newStatus;
        await application.save();

        if (newStatus === "rejected") {
            const applicantName = application.applicant.fullname || "Applicant";
            const emailSubject = "Your Job Application Has Been Rejected";
            const emailText = `
                Dear ${applicantName},
                
                We regret to inform you that your application for the position "${job.title || "Unknown Position"}" at ${job.company.name || "Unknown Company"} has been rejected.
                
                Thank you for your interest in our company. We encourage you to apply for other positions that match your skills.
                If you have any questions, please contact the recruiter.
                
                Best regards,
                Job Portal Team
            `;
            const emailHtml = `
                <h2>Application Status Update</h2>
                <p>Dear ${applicantName},</p>
                <p>We regret to inform you that your application for the position <strong>"${job.title || "Unknown Position"}"</strong> at <strong>${job.company.name || "Unknown Company"}</strong> has been rejected.</p>
                <p>Thank you for your interest in our company. We encourage you to apply for other positions that match your skills.</p>
                <p>If you have any questions, please contact the recruiter.</p>
                <p>Best regards,<br>Job Portal Team</p>
            `;

            try {
                await sendEmail(application.applicant.email, emailSubject, emailText, emailHtml);
            } catch (emailError) {
                console.error("Failed to send email, proceeding with status update:", emailError.message);
            }
        }

        const populatedApplication = await Application.findById(applicationId)
            .populate({
                path: "job",
                select: "title description requirements company salary experienceLevel location jobType position deadline benefits level",
                populate: {
                    path: "company",
                    select: "name description website location logo contactInfo"
                }
            })
            .populate({
                path: "applicant",
                select: "fullname email"
            });

        const coverLetterLines = populatedApplication.coverLetter
            ? populatedApplication.coverLetter.split("\n").map(line => line.trim()).filter(line => line)
            : [];
        const jobDescriptionLines = populatedApplication.job.description
            ? populatedApplication.job.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];
        const companyDescriptionLines = populatedApplication.job.company.description
            ? populatedApplication.job.company.description.split("\n").map(line => line.trim()).filter(line => line)
            : [];

        return res.status(200).json({
            message: "Status updated successfully",
            application: {
                id: populatedApplication._id,
                job: {
                    ...populatedApplication.job._doc,
                    description: jobDescriptionLines,
                    company: {
                        ...populatedApplication.job.company._doc,
                        description: companyDescriptionLines
                    },
                    deadline: populatedApplication.job.deadline
                        ? populatedApplication.job.deadline.toISOString().split("T")[0]
                        : null
                },
                applicant: populatedApplication.applicant,
                resume: populatedApplication.resume,
                coverLetter: coverLetterLines,
                status: populatedApplication.status,
                createdAt: populatedApplication.createdAt,
                updatedAt: populatedApplication.updatedAt
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const deleteApplication = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId)
            .populate({
                path: "job",
                select: "title company applications",
                populate: {
                    path: "company",
                    select: "userId name"
                }
            })
            .populate({
                path: "applicant",
                select: "fullname email"
            });
        ;

        if (!application) {
            throw createError("Application not found", 404);
        }

        console.log("Company:", {
            email: application.applicant?.email,
            fullname: application.applicant?.fullname
        });
        if (!application.applicant.email) {
            console.error("No email found for applicant:", application.applicant._id);
            throw createError("Applicant email is missing", 400);
        }

        if (application.resume) {
            const publicId = application.resume.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`resumes/${publicId}`, { resource_type: "raw" });
        }

        const job = application.job;
        job.applications = job.applications.filter(appId => appId.toString() !== applicationId);
        await job.save();

        console.log("applicant's name: ", application.applicant.fullname);
        const deletedBy = `the recruiter at ${application.job.company.name}`;
        const emailSubject = "Your Job Application Has Been Deleted";
        const emailText = `
            Dear ${application.applicant.fullname},
            
            Your application for the position "${application.job.title}" has been deleted by ${deletedBy}.
            Application Status: ${application.status}
            Company: ${application.job.company.name}
            
            If you have any questions, please contact the recruiter.
            
            Best regards,
            Job Portal Team
        `;
        const emailHtml = `
            <h2>Application Deleted</h2>
            <p>Dear ${application.applicant.fullname},</p>
            <p>Your application for the position <strong>"${application.job.title}"</strong> has been deleted by ${deletedBy}.</p>
            <ul>
                <li><strong>Application Status:</strong> ${application.status}</li>
                <li><strong>Company:</strong> ${application.job.company.name}</li>
            </ul>
            <p>If you have any questions, please contact the recruiter.</p>
            <p>Best regards,<br>Job Portal Team</p>
        `;

        await sendEmail(application.applicant.email, emailSubject, emailText, emailHtml);

        await Application.findByIdAndDelete(applicationId);

        return res.status(200).json({
            message: "Application deleted successfully",
            data: {
                applicationId,
                jobId: application.job._id,
                deletedBy: "recruiter",
                status: application.status
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};