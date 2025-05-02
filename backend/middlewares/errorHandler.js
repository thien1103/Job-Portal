import { AppError } from '../utils/appError.js';

export const errorHandler = (error, req, res, next) => {
    console.error("Error caught by errorHandler:", error.stack || error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message,
            status: error.status,
            details: error.details || null,
        });
    } else {
        console.error('Unexpected error:', error.stack);
        res.status(500).json({
            message: 'Server error',
            status: 'error',
        });
    }
};
