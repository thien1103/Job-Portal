import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { createError } from "../utils/appError.js";
import mongoose from "mongoose";

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw createError("Invalid User ID format", 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        if (user._id.toString() === req.user._id.toString()) {
            throw createError("You cannot delete your own account", 403);
        }

        if (user.role === "recruiter") {
            await Job.deleteMany({ createdBy: userId });
            await Company.deleteMany({ createdBy: userId });
        }
        await Application.deleteMany({ userId });
        await RefreshToken.deleteMany({ userId });

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Error in deleteUser:", error.message);
        next(error);
    }
};

export const deleteCompany = async (req, res, next) => {
    try {
        const companyId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw createError("Invalid Company ID format", 400);
        }

        const company = await Company.findById(companyId);
        if (!company) {
            throw createError("Company not found", 404);
        }

        await Job.deleteMany({ company: companyId });

        await Company.findByIdAndDelete(companyId);

        return res.status(200).json({
            message: "Company deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Error in deleteCompany:", error.message);
        next(error);
    }
};

export const getStatistics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const totalApplications = await Application.countDocuments();

        const userStats = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        const roleStats = userStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, { applicant: 0, recruiter: 0, admin: 0 });

        return res.status(200).json({
            message: "Statistics retrieved successfully",
            statistics: {
                totalUsers,
                totalJobs,
                totalCompanies,
                totalApplications,
                roleStats
            },
            success: true
        });
    } catch (error) {
        console.error("Error in getStatistics:", error.message);
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (keyword) {
            query = {
                $or: [
                    { fullname: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const users = await User.find(query)
            .select("_id fullname email role")
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Users retrieved for deletion",
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            success: true
        });
    } catch (error) {
        console.error("Error in getUsersForDeletion:", error.message);
        next(error);
    }
};

export const getApplicants = async (req, res, next) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { role: "applicant" };
        if (keyword) {
            query = {
                ...query,
                $or: [
                    { fullname: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const users = await User.find(query)
            .select("_id fullname email role")
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Applicants retrieved for deletion",
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            success: true
        });
    } catch (error) {
        console.error("Error in getApplicantsForDeletion:", error.message);
        next(error);
    }
};

export const getRecruiters = async (req, res, next) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { role: "recruiter" };
        if (keyword) {
            query = {
                ...query,
                $or: [
                    { fullname: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const users = await User.find(query)
            .select("_id fullname email role")
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Recruiters retrieved for deletion",
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            success: true
        });
    } catch (error) {
        console.error("Error in getRecruitersForDeletion:", error.message);
        next(error);
    }
};

export const getCompaniesForDeletion = async (req, res, next) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (keyword) {
            query = {
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { location: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const companies = await Company.find(query)
            .select("_id name location")
            .skip(skip)
            .limit(limit);

        const total = await Company.countDocuments(query);

        return res.status(200).json({
            message: "Companies retrieved for deletion",
            companies,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            success: true
        });
    } catch (error) {
        console.error("Error in getCompaniesForDeletion:", error.message);
        next(error);
    }
};