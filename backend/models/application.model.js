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
        index: { expires: 300 } // 2 days
    }
}, { timestamps: true });
export const Application = mongoose.model("Application", applicationSchema);