import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['applicant', 'recruiter', 'admin'],
        required: true
    },
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        resume: { type: String }, // URL to resume file
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: {
            type: String,
            default: ""
        },
        experience: [
            {
                jobTitle: { type: String },
                company: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
                description: { type: String },
            },
        ],
        education: [
            {
                degree: { type: String },
                institution: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
        isPublic: { type: Boolean, default: false },
        isFindJob: { type: Boolean, default: function () { return this.role === 'applicant'; } },
        lastFindJobUpdate: { type: Date },
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
}, { timestamps: true });

userSchema.index({ skills: 1 });
userSchema.index({ experience: 1 });
userSchema.index({ savedJobs: 1 });
export const User = mongoose.model('User', userSchema);