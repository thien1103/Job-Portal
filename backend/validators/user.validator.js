import { body, validationResult } from 'express-validator';
import { createError } from '../utils/appError.js';

export const registerValidationRules = () => [
    body('fullname')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    body('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10,15}$/)
        .withMessage('Phone number must be between 10 and 15 digits'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['applicant', 'recruiter', 'admin'])
        .withMessage('Role must be either "applicant", "recruiter" or "admin"'),
];

export const loginValidationRules = () => [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['applicant', 'recruiter', 'admin'])
        .withMessage('Role must be either "applicant", "recruiter", or "admin"'),
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        throw createError('Validation failed', 400, errorMessages);
    }
    next();
};