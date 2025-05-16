import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import axios from "axios";
import { PDFExtract } from "pdf.js-extract";

import { User } from "../models/user.model.js";
import { CV } from "../models/cv.model.js";
import { RefreshToken } from '../models/token.model.js';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../configs/cloudinary.js";
import { createError } from "../utils/appError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const register = async (req, res, next) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !password || !role) {
            throw createError('Fullname, email, password, and role are required', 400);
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError('Invalid email format', 400);
        }
        if (isNaN(phoneNumber) || phoneNumber <= 0) {
            throw createError('Phone number is invalid', 400);
        }
        if (password.length < 6) {
            throw createError('Password must have at least 6 characters', 400);
        }
        if (!['applicant', 'recruiter', 'admin'].includes(role)) {
            throw createError('Role is invalid', 400);
        }

        let profilePhoto = "https://res.cloudinary.com/ddhjuylxz/image/upload/v1746630271/profile_user.jpg_bqb5ef.jpg";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }

        const user = await User.findOne({ email });
        if (user) {
            throw createError('User already exists with this email', 400);
        }

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            throw createError('Phone number already in use', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Profile photo: ", profilePhoto);

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            data: {
                email: newUser.email,
                fullname: newUser.fullname,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            throw createError('Email, password, and role are required', 400);
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError('Invalid email format', 400);
        }
        if (password.length < 6) {
            throw createError('Password must have at least 6 characters', 400);
        }
        if (!['applicant', 'recruiter', 'admin'].includes(role)) {
            throw createError('Role is invalid', 400);
        }

        let user = await User.findOne({ email });
        if (!user) {
            throw createError("Incorrect email or password", 400);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw createError("Incorrect email or password", 400);
        };
        // check role is correct or not
        if (role !== user.role) {
            throw createError("Account doesn't exist with current role", 400);
        };

        const token = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        // Set cookies
        const isProduction = process.env.NODE_ENV === "production";

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: '/'
        };

        const refreshCookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        };

        console.log("Setting cookies:", {
            token,
            refreshToken,
            isProduction,
            cookieOptions,
            refreshCookieOptions
        });


        res.cookie('token', token, cookieOptions);
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        return res.status(200).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = req.user;
        return res.status(200).json({
            message: "User retrieved successfully",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: user.profile
            },
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }
        // Clear both cookies
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 0,
        });
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 0,
        });

        return res.status(200).json({
            message: 'Logged out successfully.',
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw createError('No refresh token provided', 401);
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            throw createError('Invalid refresh token', 403);
        }

        // Check refreshToken in database
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw createError('Refresh token is invalid or expired', 403);
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        // Generate new tokens
        const newAccessToken = await generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        // Delete old refresh token and save a new one
        await RefreshToken.deleteOne({ token: refreshToken });
        await RefreshToken.create({
            userId: user._id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Set new tokens in cookies
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1 * 24 * 60 * 60 * 10000,
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: 'Token refreshed', success: true });
    } catch (error) {
        next(error);
    }
}
export const updateProfile = async (req, res, next) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.user._id; // middleware authentication

        if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError("Invalid email format", 400);
        }
        if (fullname !== undefined && fullname && !fullname.trim()) {
            throw createError("Fullname cannot be empty", 400);
        }

        let user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        if (email !== undefined && email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw createError("Email already in use", 400);
            }
        }

        if (phoneNumber !== undefined && phoneNumber && phoneNumber !== user.phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone && existingPhone._id.toString() !== userId.toString()) {
                throw createError("Phone number already in use", 400);
            }
        }

        // updating data
        const updates = {};
        if (fullname !== undefined) updates.fullname = fullname;
        if (email !== undefined) updates.email = email;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (bio !== undefined) updates["profile.bio"] = bio;
        if (skills !== undefined) {
            if (Array.isArray(skills)) {
                updates["profile.skills"] = skills.map(item => item.trim()).filter(item => item);
            } else if (typeof skills === "string") {
                updates["profile.skills"] = skills.split(",").map(item => item.trim()).filter(item => item);
            } else {
                throw createError("Skills must be a string or array of strings", 400);
            }
        }

        if (Object.keys(updates).length === 0) {
            throw createError("No valid fields provided for update", 400);
        }

        user.set(updates);
        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: {
                profilePhoto: user.profile.profilePhoto,
                skills: user.profile.skills,
                bio: user.profile.bio,
            },
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw createError("User not found", 404);
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const setProfilePublic = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        user.profile.isPublic = !user.profile.isPublic;
        await user.save();

        return res.status(200).json({
            message: `Profile set to ${user.profile.isPublic ? "public" : "private"} successfully`,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            throw createError('Current password and new password are required', 400);
        }
        if (newPassword.length < 6) {
            throw createError('New password must have at least 6 characters', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            throw createError('Current password is not correct', 400);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully',
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const uploadCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            throw createError("PDF file is required", 400);
        }

        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (fileExtension !== ".pdf") {
            throw createError("Only PDF files are supported", 400);
        }

        const originalName = Buffer.from(file.originalname, "utf-8").toString("utf-8");
        const title = path.basename(file.originalname, ".pdf");
        if (!title) {
            throw createError("Invalid file name", 400);
        }

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: "raw",
            format: "pdf"
        });

        const cvData = {
            userId,
            title,
            resume: cloudResponse.secure_url,
            resumeOriginalName: file.originalname,
            isPrimary: false,
            isUploaded: true,
        };

        const cv = await CV.create(cvData);

        return res.status(201).json({
            message: "CV uploaded successfully",
            cv,
            success: true,
        });
    } catch (error) {
        console.log("error uploadCV controller: ", error);
        next(error);
    }
};

export const getCVs = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type } = req.query;

        let query = { userId };
        if (type === "uploaded") {
            query.isUploaded = true;
        }

        const cvs = await CV.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "CVs retrieved successfully",
            cvs,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cvId } = req.params;

        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            throw createError("CV not found or unauthorized", 404);
        }

        return res.status(200).json({
            message: "CV retrieved successfully",
            cv,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const downloadCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cvId } = req.params;

        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            throw createError("CV not found or you are not authorized to download it", 404);
        }

        const fileExtension = path.extname(cv.resumeOriginalName).toLowerCase();
        if (fileExtension !== ".pdf") {
            throw createError("Only PDF files are supported for download", 400);
        }

        const response = await axios({
            url: cv.resume,
            method: "GET",
            responseType: "stream",
            timeout: 10000,
        });

        const contentType = response.headers["content-type"];

        if (!contentType || (!contentType.includes("application/pdf") && !contentType.includes("application/octet-stream"))) {
            throw createError(`Invalid file type: ${contentType || "unknown"}`, 400);
        }

        res.setHeader("Content-Disposition", `attachment; filename="${cv.resumeOriginalName}"`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", response.headers["content-length"] || 0);


        response.data.pipe(res);

    } catch (error) {
        console.error("Error in downloadCV:", error.message);
        if (error.response) {
            next(createError(`Failed to fetch file from Cloudinary: ${error.response.statusText}`, error.response.status));
        } else if (error.name === "MongoError") {
            next(createError("Database error while retrieving CV", 500));
        } else if (error.code === "ECONNABORTED") {
            next(createError("Request to Cloudinary timed out", 504));
        } else {
            next(error);
        }
    }
};

export const deleteCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cvId } = req.params;

        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            throw createError("CV not found or unauthorized", 404);
        }

        await cv.deleteOne();

        return res.status(200).json({
            message: "CV deleted successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cvId } = req.params;
        const { title } = req.body;
        const file = req.file;

        const cv = await CV.findOne({ _id: cvId, userId, isUploaded: true });
        if (!cv) {
            throw createError("CV not found, not uploaded, or unauthorized", 404);
        }

        let cloudResponse;
        let newTitle = cv.title;
        let newResumeOriginalName = cv.resumeOriginalName;

        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                resource_type: "raw",
            });
            newTitle = title || path.basename(file.originalname, ".pdf");
            newResumeOriginalName = title ? `${title}.pdf` : file.originalname;
        } else if (title) {
            newTitle = title;
            newResumeOriginalName = `${title}.pdf`;
        }

        cv.title = newTitle;
        cv.resume = cloudResponse ? cloudResponse.secure_url : cv.resume;
        cv.resumeOriginalName = newResumeOriginalName;
        cv.updatedAt = Date.now();

        await cv.save();
        return res.status(200).json({
            message: "CV updated successfully",
            cv,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const setPrimaryCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { cvId } = req.params;

        const cv = await CV.findOne({ _id: cvId, userId, isUploaded: true });
        if (!cv) {
            throw createError("CV not found, not uploaded, or unauthorized", 404);
        }

        const newIsPrimary = !cv.isPrimary;
        if (newIsPrimary) {
            await CV.updateMany({ userId, _id: { $ne: cvId } }, { isPrimary: false });
        }
        cv.isPrimary = newIsPrimary;
        cv.updatedAt = Date.now();
        await cv.save();

        return res.status(200).json({
            message: `CV "${cv.title}" set to ${newIsPrimary ? "primary" : "non-primary"} successfully`,
            cv: {
                _id: cv._id,
                title: cv.title,
                isPrimary: cv.isPrimary,
                resume: cv.resume,
                resumeOriginalName: cv.resumeOriginalName,
            },
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
export const addExperience = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { jobTitle, company, startDate, endDate, description } = req.body;

        if (!jobTitle || !company || !startDate) {
            throw createError("jobTitle, company, and startDate are required", 400);
        }
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            throw createError("Invalid startDate format (use YYYY-MM-DD)", 400);
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            throw createError("Invalid endDate format (use YYYY-MM-DD)", 400);
        }

        const experienceData = {
            jobTitle,
            company,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            description: description || "",
        };

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $push: { "profile.experience": experienceData },
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            throw createError("User not found", 404);
        }

        return res.status(201).json({
            message: "Experience added successfully",
            experience: user.profile.experience,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getExperience = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        return res.status(200).json({
            message: "Experience retrieved successfully",
            experience: user.profile.experience,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const updateExperience = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { jobTitle, company, startDate, endDate, description } = req.body;

        if (!jobTitle || !company || !startDate) {
            throw createError("jobTitle, company, and startDate are required", 400);
        }
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            throw createError("Invalid startDate format (use YYYY-MM-DD)", 400);
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            throw createError("Invalid endDate format (use YYYY-MM-DD)", 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        const experience = user.profile.experience.id(id);
        if (!experience) {
            throw createError("Experience not found", 404);
        }

        experience.jobTitle = jobTitle;
        experience.company = company;
        experience.startDate = new Date(startDate);
        experience.endDate = endDate ? new Date(endDate) : null;
        experience.description = description || "";

        await user.save();

        return res.status(200).json({
            message: "Experience updated successfully",
            experience: user.profile.experience,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteExperience = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        const experience = user.profile.experience.id(id);
        if (!experience) {
            throw createError("Experience not found", 404);
        }

        user.profile.experience.pull(id);
        await user.save();

        return res.status(200).json({
            message: "Experience deleted successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const addEducation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { degree, institution, startDate, endDate } = req.body;

        if (!degree || !institution || !startDate) {
            throw createError("degree, institution, and startDate are required", 400);
        }
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            throw createError("Invalid startDate format (use YYYY-MM-DD)", 400);
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            throw createError("Invalid endDate format (use YYYY-MM-DD)", 400);
        }

        const educationData = {
            degree,
            institution,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        };

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $push: { "profile.education": educationData },
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            throw createError("User not found", 404);
        }

        return res.status(201).json({
            message: "Education added successfully",
            education: user.profile.education,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getEducation = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        return res.status(200).json({
            message: "Education retrieved successfully",
            education: user.profile.education,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const updateEducation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { degree, institution, startDate, endDate } = req.body;

        if (!degree || !institution || !startDate) {
            throw createError("degree, institution, and startDate are required", 400);
        }
        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            throw createError("Invalid startDate format (use YYYY-MM-DD)", 400);
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            throw createError("Invalid endDate format (use YYYY-MM-DD)", 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        const education = user.profile.education.id(id);
        if (!education) {
            throw createError("Education not found", 404);
        }

        education.degree = degree;
        education.institution = institution;
        education.startDate = new Date(startDate);
        education.endDate = endDate ? new Date(endDate) : null;

        await user.save();

        return res.status(200).json({
            message: "Education updated successfully",
            education: user.profile.education,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEducation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        const education = user.profile.education.id(id);
        if (!education) {
            throw createError("Education not found", 404);
        }

        user.profile.education.pull(id);
        await user.save();

        return res.status(200).json({
            message: "Education deleted successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicantProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select(
            "fullname email phoneNumber role profile experience education"
        );

        if (!user) {
            throw createError("Applicant not found", 404);
        }
        if (!user.profile.isPublic) {
            throw createError("Applicant's profile is not public", 403);
        }

        const userResponse = {
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: {
                profilePhoto: user.profile.profilePhoto,
                skills: user.profile.skills,
                bio: user.profile.bio,
            },
            experience: user.experience,
            education: user.education,
        };

        return res.status(200).json({
            message: "Applicant profile retrieved successfully",
            user: userResponse,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicantPrimaryCV = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("profile.isPublic");
        if (!user) {
            throw createError("Applicant not found", 404);
        }

        if (!user.profile.isPublic) {
            throw createError("Applicant's profile is not public", 403);
        }

        const cv = await CV.findOne({ userId, isPrimary: true, isUploaded: true });
        if (!cv) {
            throw createError("No primary CV found or CV not uploaded", 404);
        }

        return res.status(200).json({
            message: "Primary CV retrieved successfully",
            cv: {
                title: cv.title,
                resume: cv.resume,
                resumeOriginalName: cv.resumeOriginalName,
            },
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// export const updateProfileFromCV = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const file = req.file;

//         if (!file) {
//             throw createError("PDF file is required", 400);
//         }

//         const allowedMimeTypes = ["application/pdf"];
//         const fileExtension = file.originalname.split(".").pop().toLowerCase();
//         if (!allowedMimeTypes.includes(file.mimetype) || fileExtension !== "pdf") {
//             throw createError("Only PDF files are allowed", 400);
//         }

//         const pdfExtract = new PDFExtract();
//         const data = await pdfExtract.extractBuffer(file.buffer, {});
//         const text = data.pages
//             .map(page => {
//                 return page.content
//                     .sort((a, b) => a.y - b.y || a.x - b.x)
//                     .map(item => item.str)
//                     .join(" ");
//             })
//             .join("\n")
//             .replace(/\s+/g, " ")
//             .replace(/([A-Z])\s+([A-Z])\s+([A-Z])/g, "$1$2$3");

//         console.log("Extracted raw text:", text);

//         const prompt = `
// You are an expert in parsing resumes/CVs. Below is the raw text extracted from a CV, which may contain irregular spacing or formatting. Extract the following information in a structured JSON format. Ensure all fields are filled, even if data is missing, using empty strings or null where applicable. Do NOT extract fullname, email, or phoneNumber.

// - bio: A summary or objective (if available)
// - skills: A list of skills (e.g., programming languages, tools, etc.). Ensure each skill is a concise string (e.g., "Node.js", not "Backend developing with Node.js runtime").
// - experience: A list of work experiences, each with jobTitle, company, startDate (in YYYY-MM-DD format), endDate (in YYYY-MM-DD format), and description. Ensure dates are correctly formatted.
// - education: A list of educational qualifications, each with degree, institution, startDate (in YYYY-MM-DD format), and endDate (in YYYY-MM-DD format). If dates are missing, use null.

// Here is the raw text from the CV:

// ${text}

// Return ONLY the JSON object with the extracted information in the exact format requested. Do not include any additional text, explanations, or markdown. Ensure the output is a valid JSON string.
// `;

//         const response = await fetch("http://localhost:11434/api/generate", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 model: "mistral",
//                 prompt: prompt,
//                 stream: false,
//                 options: {
//                     temperature: 0.3,
//                     max_tokens: 1500
//                 }
//             }),
//         });

//         if (!response.ok) {
//             throw createError("Failed to fetch response from Ollama. Ensure Ollama server is running at http://localhost:11434.", 500);
//         }

//         const responseData = await response.json();
//         const responseText = responseData.response.trim();


//         let parsedData;
//         try {
//             parsedData = JSON.parse(responseText);
//         } catch (e) {
//             console.log("Raw response from Ollama:", responseText);
//             const jsonMatch = responseText.match(/{[\s\S]*}/);
//             if (jsonMatch) {
//                 try {
//                     parsedData = JSON.parse(jsonMatch[0]);
//                 } catch (innerError) {
//                     throw createError("Failed to parse JSON from Ollama response even after extraction. Check raw response in logs.", 500);
//                 }
//             } else {
//                 throw createError("Failed to parse JSON from Ollama response. No valid JSON found. Check raw response in logs.", 500);
//             }
//         }

//         console.log("Parsed data from Ollama:", parsedData);

//         const user = await User.findById(userId);
//         if (!user) {
//             throw createError("User not found", 404);
//         }

//         user.profile = {
//             ...user.profile,
//             bio: parsedData.bio || user.profile.bio,
//             skills: parsedData.skills || user.profile.skills,
//             experience: parsedData.experience?.map(exp => ({
//                 jobTitle: exp.jobTitle || "",
//                 company: exp.company || "",
//                 startDate: exp.startDate ? new Date(exp.startDate) : null,
//                 endDate: exp.endDate ? new Date(exp.endDate) : null,
//                 description: exp.description || ""
//             })) || user.profile.experience,
//             education: parsedData.education?.map(edu => ({
//                 degree: edu.degree || "",
//                 institution: edu.institution || "",
//                 startDate: edu.startDate ? new Date(edu.startDate) : null,
//                 endDate: edu.endDate ? new Date(edu.endDate) : null
//             })) || user.profile.education,
//             isPublic: user.profile.isPublic
//         };

//         await user.save();

//         return res.status(200).json({
//             message: "Profile updated successfully from CV",
//             user,
//             success: true
//         });
//     } catch (error) {
//         console.log("Error in updateProfileFromCV: ", error);
//         next(error);
//     }
// };

// Hàm kiểm tra định dạng ngày hợp lệ
const isValidDateString = (dateString) => {
    if (!dateString || dateString === "Now" || dateString === "") return false;
    const regex = /^(0[1-12]|1[0-2])\/[0-9]{4}$|^[0-9]{4}$|^[A-Za-z]{3}, [0-9]{4}$/;
    return regex.test(dateString);
};

// Hàm chuẩn hóa ngày
const normalizeDate = (dateString) => {
    if (!isValidDateString(dateString)) return null;
    if (dateString.includes("/")) {
        const [month, year] = dateString.split("/");
        return new Date(`${year}-${month}-01`).toISOString();
    }
    if (dateString.includes(", ")) {
        const [monthStr, year] = dateString.split(", ");
        const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth() + 1;
        if (isNaN(monthIndex)) return null;
        return new Date(`${year}-${monthIndex.toString().padStart(2, "0")}-01`).toISOString();
    }
    return new Date(`${dateString}-01-01`).toISOString();
};

export const updateProfileFromCV = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            throw createError("CV file is required", 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw createError("User not found", 404);
        }

        const allowedMimeTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
            "image/png",
            "image/jpeg",
        ];
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const supportedFormats = ["pdf", "docx", "doc", "txt", "png", "jpg"];
        if (!allowedMimeTypes.includes(file.mimetype) || !supportedFormats.includes(fileExtension)) {
            throw createError("Only PDF, DOCX, DOC, TXT, PNG, and JPG formats are supported", 400);
        }

        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "raw", format: fileExtension },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(file.buffer);
        });

        const cvUrl = uploadResponse.secure_url;
        console.log("Cloudinary URL:", cvUrl);

        let rawText = "";
        if (fileExtension === "pdf") {
            try {
                const pdfExtract = new PDFExtract();
                const pdfData = await pdfExtract.extractBuffer(file.buffer, {});
                rawText = pdfData.pages
                    .map((page) =>
                        page.content
                            .sort((a, b) => a.y - b.y || a.x - b.x)
                            .map((item) => item.str)
                            .join(" ")
                    )
                    .join("\n")
                    .replace(/\s+/g, " ")
                    .replace(/([A-Z])\s+([A-Z])\s+([A-Z])/g, "$1$2$3");
                console.log("Extracted raw text:", rawText);
            } catch (extractError) {
                console.error("Error extracting raw text from PDF:", extractError);
                rawText = "";
            }
        }

        const options = {
            method: "POST",
            url: "https://resume-parsing-api2.p.rapidapi.com/processDocument",
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": "resume-parsing-api2.p.rapidapi.com",
                "Content-Type": "application/json",
            },
            data: {
                extractionDetails: {
                    name: "Resume - Extraction",
                    language: "English",
                    fields: [
                        {
                            key: "personal_info",
                            description: "personal information of the person",
                            type: "object",
                            properties: [
                                { key: "name", description: "name of the person", example: "Alex Smith", type: "string" },
                                { key: "email", description: "email of the person", example: "alex.smith@gmail.com", type: "string" },
                                { key: "phone", description: "phone of the person", example: "0712 123 123", type: "string" },
                                { key: "address", description: "address of the person", example: "Bucharest, Romania", type: "string" },
                            ],
                        },
                        {
                            key: "work_experience",
                            description: "work experience of the person",
                            type: "array",
                            items: {
                                type: "object",
                                properties: [
                                    { key: "title", description: "title of the job", example: "Software Engineer", type: "string" },
                                    { key: "start_date", description: "start date of the job", example: "2022", type: "string" },
                                    { key: "end_date", description: "end date of the job", example: "2023", type: "string" },
                                    { key: "company", description: "company of the job", example: "Fastapp Development", type: "string" },
                                    { key: "location", description: "location of the job", example: "Bucharest, Romania", type: "string" },
                                    { key: "description", description: "description of the job", example: "Designing and implementing server-side logic.", type: "string" },
                                ],
                            },
                        },
                        {
                            key: "education",
                            description: "school education of the person",
                            type: "array",
                            items: {
                                type: "object",
                                properties: [
                                    { key: "title", description: "title of the education", example: "Master of Science in Computer Science", type: "string" },
                                    { key: "start_date", description: "start date of the education", example: "2022", type: "string" },
                                    { key: "end_date", description: "end date of the education", example: "2023", type: "string" },
                                    { key: "institute", description: "institute of the education", example: "Bucharest Academy of Economic Studies", type: "string" },
                                    { key: "location", description: "location of the education", example: "Bucharest, Romania", type: "string" },
                                    { key: "description", description: "description of the education", example: "Advanced academic degree focusing on computer technology.", type: "string" },
                                ],
                            },
                        },
                        {
                            key: "languages",
                            description: "languages spoken by the person",
                            type: "array",
                            items: { type: "string", example: "English" },
                        },
                        {
                            key: "skills",
                            description: "skills of the person",
                            type: "array",
                            items: { type: "string", example: "NodeJS" },
                        },
                        {
                            key: "certificates",
                            description: "certificates of the person",
                            type: "array",
                            items: { type: "string", example: "AWS Certified Developer - Associate" },
                        },
                    ],
                },
                file: cvUrl,
            },
        };

        const response = await axios.request(options);
        if (response.status !== 200) {
            throw createError(`Failed to fetch response from RapidAPI. Status: ${response.status}`, response.status);
        }

        const rapidApiData = response.data;
        console.log("Raw RapidAPI response:", JSON.stringify(rapidApiData, null, 2));

        const parsedData = {
            // personal_info: rapidApiData.personal_info || {},
            skills: rapidApiData.skills || [],
            experience: [],
            education: [],
        };

        // user.fullname = parsedData.personal_info.name || user.fullname;
        // user.email = parsedData.personal_info.email || user.email;
        // user.phoneNumber = parsedData.personal_info.phone || user.phoneNumber;

        if (Array.isArray(rapidApiData.work_experience)) {
            parsedData.experience = rapidApiData.work_experience
                .filter((exp) => exp.title && exp.company)
                .map((exp) => ({
                    jobTitle: exp.title || "",
                    company: exp.company || "",
                    startDate: normalizeDate(exp.start_date),
                    endDate: normalizeDate(exp.end_date),
                    description: exp.description || `${exp.start_date || ""} - ${exp.end_date || "Present"}`,
                }));
        }

        if (Array.isArray(rapidApiData.education)) {
            parsedData.education = rapidApiData.education
                .filter((edu) => edu.title || edu.institute)
                .map((edu) => ({
                    degree: edu.title || "",
                    institution: edu.institute || "",
                    startDate: normalizeDate(edu.start_date),
                    endDate: normalizeDate(edu.end_date),
                }));
        }

        user.profile = {
            ...user.profile,
            skills: parsedData.skills,
            experience: parsedData.experience,
            education: parsedData.education,
            profilePhoto: user.profile.profilePhoto || "",
            isPublic: user.profile.isPublic || false,
        };

        await user.save();

        const responseData = {
            message: "Update profile from CV successfully",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profile: {
                    skills: user.profile.skills,
                    profilePhoto: user.profile.profilePhoto,
                    experience: user.profile.experience,
                    education: user.profile.education,
                    isPublic: user.profile.isPublic,
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            success: true,
        };

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in updateProfileFromCV:", error);
        next(error);
    }
};