import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
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
            throw createError('Refresh token không hợp lệ hoặc đã hết hạn', 403);
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

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError('Invalid email format', 400);
        }
        if (fullname && !fullname.trim()) {
            throw createError('Fullname cannot be empty', 400);
        }

        const file = req.file;
        // cloudinary
        let cloudResponse;
        if (file) {
            try {
                const fileUri = getDataUri(file);
                cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            } catch (uploadError) {
                throw createError('Failed to upload file to Cloudinary', 500);
            }
        }


        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.user.id; // middleware authentication
        let user = await User.findById(userId);
        console.log(user);
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
        if (skillsArray) updates['profile.skills'] = skillsArray;

        // resume comes later here...

        if (cloudResponse) {
            updates['profile.resume'] = cloudResponse.secure_url;
            updates['profile.resumeOriginalName'] = file.originalname;
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
}