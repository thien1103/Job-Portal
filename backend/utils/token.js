import jwt from "jsonwebtoken";

export const generateAccessToken = async (user) => {
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
    );
    return token;
};

export const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign({
        userId: user._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
    return refreshToken;
};