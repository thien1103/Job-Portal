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
        const DeletionLog = mongoose.model('DeletionLog', new mongoose.Schema({
            applicationId: mongoose.Schema.Types.ObjectId,
            jobId: mongoose.Schema.Types.ObjectId,
            applicantId: mongoose.Schema.Types.ObjectId,
            status: String,
            rejectedAt: Date,
            deletedAt: { type: Date, default: Date.now, index: { expires: 120 } },
        }), 'deletionLogs');

        await DeletionLog.create({
            applicationId: this._id,
            jobId: this.job,
            applicantId: this.applicant,
            status: this.status,
            rejectedAt: this.rejectedAt,
        });
        console.log(`Logged document deletion for application ${this._id} with job ${this.job}`);
        next();
    } catch (error) {
        console.error(`Error in pre-deleteOne (document) middleware for application ${this._id}:`, error);
        next();
    }
});

applicationSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    try {
        const filter = this.getFilter();
        const app = await this.model.findOne(filter);
        if (!app) {
            console.warn(`No application found for query deletion with filter:`, filter);
            return next();
        }

        const DeletionLog = mongoose.model('DeletionLog', new mongoose.Schema({
            applicationId: mongoose.Schema.Types.ObjectId,
            jobId: mongoose.Schema.Types.ObjectId,
            applicantId: mongoose.Schema.Types.ObjectId,
            status: String,
            rejectedAt: Date,
            deletedAt: { type: Date, default: Date.now, index: { expires: 120 } },
        }), 'deletionLogs');

        await DeletionLog.create({
            applicationId: app._id,
            jobId: app.job,
            applicantId: app.applicant,
            status: app.status,
            rejectedAt: app.rejectedAt,
        });
        console.log(`Logged query deletion for application ${app._id} with job ${app.job}`);
        next();
    } catch (error) {
        console.error(`Error in pre-deleteOne (query) middleware:`, error);
        next();
    }
});
export const Application = mongoose.model("Application", applicationSchema);