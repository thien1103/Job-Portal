import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";

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

        let profilePhoto = "";
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhoto = cloudResponse.secure_url;
        }

        const user = await User.findOne({ email });
        if (user) {
            throw createError('User already exists with this email', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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