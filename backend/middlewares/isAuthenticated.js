import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";

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
            return next(createError('Access token đã hết hạn', 401));
        }
        next(error);
    }
};