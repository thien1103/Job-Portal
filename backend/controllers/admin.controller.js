import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/token.model.js";
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
        }, { applicant: 0, recruiter: 0 });


        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const usersByDay = await User.aggregate([
            {
                $match: { createdAt: { $gte: thirtyDaysAgo } },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
        const usersByWeek = await User.aggregate([
            {
                $match: { createdAt: { $gte: twelveWeeksAgo } },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%U", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);


        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const usersByMonth = await User.aggregate([
            {
                $match: { createdAt: { $gte: twelveMonthsAgo } },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        const usersByYear = await Job.aggregate([
            {
                $match: { createdAt: { $gte: fiveYearsAgo } },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newJobsLast7Days = await Job.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        return res.status(200).json({
            message: "Statistics retrieved successfully",
            statistics: {
                totalUsers,
                totalJobs,
                totalCompanies,
                totalApplications,
                roleStats,
                newUsers: {
                    byDay: usersByDay.map(stat => ({ date: stat._id, count: stat.count })),
                    byWeek: usersByWeek.map(stat => ({ week: stat._id, count: stat.count })),
                    byMonth: usersByMonth.map(stat => ({ month: stat._id, count: stat.count })),
                    byYear: usersByYear.map(stat => ({ year: stat._id, count: stat.count }))
                },
                newJobsLast7Days,
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
        const { keyword } = req.query;

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
            .select("_id fullname email role");


        if (!users || users.length === 0) {
            throw createError("No users found", 404);
        }
        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Users retrieved for deletion",
            users,
            total,
            success: true
        });
    } catch (error) {
        console.error("Error in getUsersForDeletion:", error.message);
        next(error);
    }
};

export const getAllCompanies = async (req, res, next) => {
    try {
        const { keyword } = req.query;

        let query = {};
        if (keyword) {
            query = {
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const companies = await Company.find(query)
            .select("name createdAt updatedAt")
            .populate("userId", "email fullname")


        if (!companies || companies.length === 0) {
            throw createError("No companies found", 404);
        }

        const total = await Company.countDocuments(query);

        return res.status(200).json({
            message: "Users retrieved for deletion",
            companies,
            total,
            success: true
        });
    } catch (error) {
        console.error("Error in getUsersForDeletion:", error.message);
        next(error);
    }
};

export const getApplicants = async (req, res, next) => {
    try {
        const { keyword } = req.query;

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


        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Applicants retrieved for deletion",
            users,
            total,
            success: true
        });
    } catch (error) {
        console.error("Error in getApplicantsForDeletion:", error.message);
        next(error);
    }
};

export const getRecruiters = async (req, res, next) => {
    try {
        const { keyword } = req.query;

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


        const total = await User.countDocuments(query);

        return res.status(200).json({
            message: "Recruiters retrieved for deletion",
            users,
            total,
            success: true
        });
    } catch (error) {
        console.error("Error in getRecruitersForDeletion:", error.message);
        next(error);
    }
};

export const getCompaniesForDeletion = async (req, res, next) => {
    try {
        const { keyword } = req.query;

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


        const total = await Company.countDocuments(query);

        return res.status(200).json({
            message: "Companies retrieved for deletion",
            companies,
            total,
            success: true
        });
    } catch (error) {
        console.error("Error in getCompaniesForDeletion:", error.message);
        next(error);
    }
};