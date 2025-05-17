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

applicationSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const DeletedApplication = mongoose.model('DeletedApplication', new mongoose.Schema({
            applicationId: mongoose.Schema.Types.ObjectId,
            job: mongoose.Schema.Types.ObjectId,
            applicant: {
                fullname: String,
                email: String,
            },
            title: String,
            company: {
                name: String,
            },
            status: String,
            resume: String,
            rejectedAt: Date,
            deletedAt: { type: Date, default: Date.now, index: { expires: 120 } },
        }));

        await DeletedApplication.create({
            applicationId: this._id,
            job: this.job,
            applicant: this.applicant,
            title: this.job.title,
            company: this.job.company,
            status: this.status,
            resume: this.resume,
            rejectedAt: this.rejectedAt,
        });
        console.log(`Saved deleted application data for ${this._id}`);
        next();
    } catch (error) {
        console.error("Error in pre-deleteOne middleware:", error);
        next(error);
    }
});
export const Application = mongoose.model("Application", applicationSchema);