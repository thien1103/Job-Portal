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
        deletedAt: { type: Date, default: Date.now, index: { expires: 86400 } },
    }));

    const changeStream = Application.watch([
        { $match: { operationType: "delete" } },
    ]);

    changeStream.on("change", async (change) => {
        try {
            console.log("Change Stream triggered for deletion:", change);

            const applicationId = change.documentKey._id;

            // Lấy thông tin từ DeletedApplication
            const deletedApp = await DeletedApplication.findOne({ applicationId });
            if (!deletedApp) {
                console.warn("No deleted application data found for:", applicationId);
                return;
            }

            const jobId = deletedApp.job;

            console.log(`Removing applicationId ${applicationId} from Job ${jobId}`);

            // Xóa applicationId khỏi Job.applications
            const updateResult = await Job.updateOne(
                { _id: jobId },
                { $pull: { applications: applicationId } }
            );

            console.log("Update result:", updateResult);

            if (updateResult.modifiedCount === 0) {
                console.warn(`No changes made to Job ${jobId}. ApplicationId ${applicationId} may not exist in applications array.`);
            }

            // Gửi email thông báo xóa (chỉ cho TTL)
            if (deletedApp.rejectedAt && deletedApp.applicant?.email) {
                const emailSubject = "Your Job Application Has Been Deleted";
                const emailText = `
            Dear ${deletedApp.applicant.fullname || "Applicant"},
            
            Your application for the position "${deletedApp.title || "Unknown Position"}" has been automatically deleted after 5 days of being rejected.
            Company: ${deletedApp.company?.name || "Unknown Company"}
            
            If you have any questions, please contact the recruiter.
            
            Best regards,
            Job Portal Team
          `;
                const emailHtml = `
            <h2>Application Deleted</h2>
            <p>Dear ${deletedApp.applicant.fullname || "Applicant"},</p>
            <p>Your application for the position <strong>"${deletedApp.title || "Unknown Position"}"</strong> has been automatically deleted after 5 days of being rejected.</p>
            <ul>
              <li><strong>Company:</strong> ${deletedApp.company?.name || "Unknown Company"}</li>
            </ul>
            <p>If you have any questions, please contact the recruiter.</p>
            <p>Best regards,<br>Job Portal Team</p>
          `;
                try {
                    await sendEmail(deletedApp.applicant.email, emailSubject, emailText, emailHtml);
                    console.log(`Email sent to ${deletedApp.applicant.email} for application ${applicationId}`);
                } catch (emailError) {
                    console.error("Failed to send email for deleted application:", emailError.message);
                }
            }
        } catch (error) {
            console.error("Error in change stream for application", applicationId, ":", error);
        }
    });

    changeStream.on("error", (error) => {
        console.error("Change stream error:", error);
    });

    console.log("Change Stream setup complete");
};