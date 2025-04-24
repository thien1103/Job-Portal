import mongoose from "mongoose";

const cvSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    resume: { type: String },
    resumeOriginalName: { type: String },
    isPublic: { type: Boolean, default: false },
    isUploaded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const CV = mongoose.model("CV", cvSchema);