import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    coverLetter: {
        type: String,
        default: ""
    },
    resume: {
        type: String,
        required: true
    },
    rejectedAt: {
        type: Date,
        // index: { expires: 172800 } // 2 days
        index: { expires: 300 }
    },
    acceptedAt: {
        type: Date,
        index: { expires: 300 }
    }
}, { timestamps: true });

applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });

export const Application = mongoose.model("Application", applicationSchema);