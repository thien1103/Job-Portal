import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { createError } from "../utils/appError.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw createError('User not authenticated', 401);
        }

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decode.userId).select('-password');
        if (!user) {
            throw createError('User not found', 404);
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(createError('Access token expired', 401));
        }
        next(error);
    }
};

export const isApplicant = async (req, res, next) => {
    try {
        if (req.user.role !== "applicant") {
            throw createError("Access denied. Applicant role required", 403);
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const isRecruiter = async (req, res, next) => {
    try {
        if (req.user.role !== "recruiter") {
            throw createError("Access denied. Recruiter role required", 403);
        }
        next();
    } catch (error) {
        next(error);
    }
};