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

        const file = req.file;
        if (!file) {
            throw createError('Profile photo is required', 400);
        }

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

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
                profilePhoto: cloudResponse.secure_url,
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
        res.cookie('token', token, {
            httpsOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 30 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpsOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
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
            httpsOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 0,
        });
        res.cookie('refreshToken', '', {
            httpsOnly: true,
            secure: true,
            sameSite: 'None',
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
            sameSite: 'None',
            maxAge: 30 * 60 * 1000,
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
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
        const file = req.file;

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError('Invalid email format', 400);
        }
        if (fullname && !fullname.trim()) {
            throw createError('Fullname cannot be empty', 400);
        }

        // cloudinary
        let cloudResponse;
        if (file) {
            try {
                const fileUri = getDataUri(file);
                cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: "image",
                });
            } catch (uploadError) {
                throw createError('Failed to upload file to Cloudinary', 500);
            }
        }

        let user = await User.findById(userId);
        if (!user) {
            throw createError('User not found', 404);
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw createError('Email already in use', 400);
            }
        }
        // updating data
        const updates = {};
        if (fullname) updates.fullname = fullname;
        if (email) updates.email = email;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (bio) updates['profile.bio'] = bio;
        if (skills) {
            updates["profile.skills"] = Array.isArray(skills)
                ? skills
                : skills.split(",").map((s) => s.trim());
        }
        if (cloudResponse) updates["profile.profilePhoto"] = cloudResponse.secure_url;

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
            profile: user.profile
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

export const addExperience = async (req, res, next) => {
    try {
        const userId = req.user._id; // From isAuthenticated
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

export const addEducation = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { degree, institution, startDate, endDate } = req.body;

        // Validation cơ bản
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
            isPublic: false,
            isUploaded: true,
        };

        const cv = await CV.create(cvData);

        return res.status(201).json({
            message: "CV uploaded successfully",
            cv,
            success: true,
        });
    } catch (error) {
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
}