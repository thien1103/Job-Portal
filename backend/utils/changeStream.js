import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { sendEmail } from "../middlewares/nodemailer.js";

// export const setupChangeStream = () => {
//     const Application = mongoose.model("Application");
//     const Job = mongoose.model("Job");

//     const changeStream = Application.watch([
//         { $match: { operationType: "delete" } },
//     ], { fullDocument: "updateLookup" });

//     changeStream.on("change", async (change) => {
//         try {
//             console.log("Change Stream triggered for deletion:", change);

//             const applicationId = change.documentKey._id;
//             const jobId = change.fullDocument?.job;

//             if (!jobId) {
//                 console.warn("No jobId found in deleted application:", applicationId);
//                 return;
//             }

//             console.log(`Removing applicationId ${applicationId} from Job ${jobId}`);

//             // Xóa applicationId khỏi Job.applications
//             const updateResult = await Job.updateOne(
//                 { _id: jobId },
//                 { $pull: { applications: applicationId } }
//             );

//             console.log("Update result:", updateResult);

//             if (updateResult.modifiedCount === 0) {
//                 console.warn(`No changes made to Job ${jobId}. ApplicationId ${applicationId} may not exist in applications array.`);
//             }

//             // Gửi email thông báo xóa (chỉ cho TTL)
//             if (change.fullDocument?.rejectedAt && change.fullDocument?.applicant?.email) {
//                 const emailSubject = "Your Job Application Has Been Deleted";
//                 const emailText = `
//             Dear ${change.fullDocument.applicant.fullname || "Applicant"},
            
//             Your application for the position "${change.fullDocument.job.title || "Unknown Position"}" has been automatically deleted after 5 days of being rejected.
//             Company: ${change.fullDocument.job.company?.name || "Unknown Company"}
            
//             If you have any questions, please contact the recruiter.
            
//             Best regards,
//             Job Portal Team
//           `;
//                 const emailHtml = `
//             <h2>Application Deleted</h2>
//             <p>Dear ${change.fullDocument.applicant.fullname || "Applicant"},</p>
//             <p>Your application for the position <strong>"${change.fullDocument.job.title || "Unknown Position"}"</strong> has been automatically deleted after 5 days of being rejected.</p>
//             <ul>
//               <li><strong>Company:</strong> ${change.fullDocument.job.company?.name || "Unknown Company"}</li>
//             </ul>
//             <p>If you have any questions, please contact the recruiter.</p>
//             <p>Best regards,<br>Job Portal Team</p>
//           `;
//                 try {
//                     await sendEmail(change.fullDocument.applicant.email, emailSubject, emailText, emailHtml);
//                     console.log(`Email sent to ${change.fullDocument.applicant.email} for application ${applicationId}`);
//                 } catch (emailError) {
//                     console.error("Failed to send email for deleted application:", emailError.message);
//                 }
//             }
//         } catch (error) {
//             console.error("Error in change stream for application", applicationId, ":", error);
//         }
//     });

//     changeStream.on("error", (error) => {
//         console.error("Change stream error:", error);
//     });

//     console.log("Change Stream setup complete");
// };

export const setupChangeStream = () => {
    const Application = mongoose.model("Application");
    const Job = mongoose.model("Job");
    const User = mongoose.model("User");
    const DeletionLog = mongoose.model('DeletionLog', new mongoose.Schema({
        applicationId: mongoose.Schema.Types.ObjectId,
        jobId: mongoose.Schema.Types.ObjectId,
        applicantId: mongoose.Schema.Types.ObjectId,
        status: String,
        rejectedAt: Date,
        deletedAt: { type: Date, default: Date.now, index: { expires: 86400 } },
    }), 'deletionLogs');

    const changeStream = Application.watch([
        { $match: { operationType: "delete" } },
    ], { fullDocumentBeforeChange: "whenAvailable" });

    changeStream.on("change", async (change) => {
        try {
            console.log("Change Stream triggered for deletion:", JSON.stringify(change, null, 2));

            const applicationId = change.documentKey._id;
            let jobId, applicantId, status, rejectedAt;

            // Thử lấy jobId từ fullDocumentBeforeChange
            if (change.fullDocumentBeforeChange) {
                jobId = change.fullDocumentBeforeChange.job;
                applicantId = change.fullDocumentBeforeChange.applicant;
                status = change.fullDocumentBeforeChange.status;
                rejectedAt = change.fullDocumentBeforeChange.rejectedAt;
                console.log(`Got jobId ${jobId} from fullDocumentBeforeChange for application ${applicationId}`);
            } else {
                // Fallback tới deletionLogs
                const deletionLog = await DeletionLog.findOne({ applicationId });
                if (!deletionLog) {
                    console.error(`No deletion log found for application ${applicationId}`);
                    return;
                }
                jobId = deletionLog.jobId;
                applicantId = deletionLog.applicantId;
                status = deletionLog.status;
                rejectedAt = deletionLog.rejectedAt;
                console.log(`Got jobId ${jobId} from deletionLogs for application ${applicationId}`);
            }

            if (!jobId) {
                console.error(`No jobId found for application ${applicationId}`);
                return;
            }

            // Retry logic cho $pull
            let updateResult;
            for (let attempt = 1; attempt <= 3; attempt++) {
                console.log(`Attempt ${attempt}: Removing applicationId ${applicationId} from Job ${jobId}`);
                updateResult = await Job.updateOne(
                    { _id: jobId },
                    { $pull: { applications: applicationId } }
                );
                console.log(`Update result for Job ${jobId}:`, JSON.stringify(updateResult, null, 2));
                if (updateResult.modifiedCount > 0) break;
                console.warn(`Attempt ${attempt} failed: No changes made to Job ${jobId}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }

            if (updateResult.modifiedCount === 0) {
                console.error(`Failed to remove applicationId ${applicationId} from Job ${jobId} after 3 attempts`);
                const job = await Job.findById(jobId);
                if (job && job.applications.includes(applicationId)) {
                    console.error(`ApplicationId ${applicationId} still in Job ${jobId}. Manual cleanup required.`);
                }
            }

            // Gửi email thông báo xóa (chỉ cho TTL)
            if (rejectedAt && applicantId) {
                const applicant = await User.findById(applicantId, "fullname email");
                const job = await Job.findById(jobId, "title").populate("company", "name");
                if (applicant?.email) {
                    const emailSubject = "Your Job Application Has Been Deleted";
                    const emailText = `
              Dear ${applicant.fullname || "Applicant"},
              
              Your application for the position "${job?.title || "Unknown Position"}" has been automatically deleted after 5 days of being rejected.
              Company: ${job?.company?.name || "Unknown Company"}
              
              If you have any questions, please contact the recruiter.
              
              Best regards,
              Job Portal Team
            `;
                    const emailHtml = `
              <h2>Application Deleted</h2>
              <p>Dear ${applicant.fullname || "Applicant"},</p>
              <p>Your application for the position <strong>"${job?.title || "Unknown Position"}"</strong> has been automatically deleted after 5 days of being rejected.</p>
              <ul>
                <li><strong>Company:</strong> ${job?.company?.name || "Unknown Company"}</li>
              </ul>
              <p>If you have any questions, please contact the recruiter.</p>
              <p>Best regards,<br>Job Portal Team</p>
            `;
                    try {
                        await sendEmail(applicant.email, emailSubject, emailText, emailHtml);
                        console.log(`Email sent to ${applicant.email} for application ${applicationId}`);
                    } catch (emailError) {
                        console.error(`Failed to send email for application ${applicationId}:`, emailError.message);
                    }
                }
            }
        } catch (error) {
            console.error(`Error in change stream for application ${applicationId}:`, error);
        }
    });

    changeStream.on("error", (error) => {
        console.error("Change stream error:", error);
    });

    console.log("Change Stream setup complete");
};