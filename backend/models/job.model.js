import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    deadline: {
        type: Date,
        required: true
    },
    benefits: [{
        type: String
    }],
    level: {
        type: String,
        enum: ['Intern', 'Fresher', 'Junior', 'Middle', 'Senior', 'Manager', 'Director'],
        required: true
    }
}, { timestamps: true });

jobSchema.index({ title: "text", description: "text", location: "text", requirements: "text", benefits: "text" }, { weights: { title: 10, description: 5, location: 3, requirements: 2, benefits: 1 } });
jobSchema.index({ deadline: 1 }); 
jobSchema.index({ level: 1 });

export const Job = mongoose.model("Job", jobSchema);