import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { sendEmail } from "../middlewares/nodemailer.js";

export const setupChangeStream = () => {
    const Application = mongoose.model("Application");
    const Job = mongoose.model("Job");
    const User = mongoose.model("User");

    const changeStream = Application.watch([
        { $match: { operationType: "delete" } },
    ]);

    changeStream.on("change", async (change) => {
        try {
            const applicationId = change.documentKey._id;

            // Lấy Application trước khi bị xóa
            const application = await Application.findOne({ _id: applicationId }).populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "name",
                },
            }).populate({
                path: "applicant",
                select: "fullname email",
            });

            if (!application) {
                console.warn("Deleted application not found:", applicationId);
                return;
            }

            const jobId = application.job._id;

            // Xóa applicationId khỏi Job.applications
            await Job.updateOne(
                { _id: jobId },
                { $pull: { applications: applicationId } }
            );

            // Xóa resume trên Cloudinary
            if (application.resume) {
                const publicId = application.resume.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`resumes/${publicId}`, { resource_type: "raw" });
            }

            // Gửi email thông báo xóa
            if (application.applicant?.email) {
                const emailSubject = "Your Job Application Has Been Deleted";
                const emailText = `
            Dear ${application.applicant.fullname || "Applicant"},
            
            Your application for the position "${application.job.title || "Unknown Position"}" has been automatically deleted after 5 days of being rejected.
            Company: ${application.job.company?.name || "Unknown Company"}
            
            If you have any questions, please contact the recruiter.
            
            Best regards,
            Job Portal Team
          `;
                const emailHtml = `
            <h2>Application Deleted</h2>
            <p>Dear ${application.applicant.fullname || "Applicant"},</p>
            <p>Your application for the position <strong>"${application.job.title || "Unknown Position"}"</strong> has been automatically deleted after 5 days of being rejected.</p>
            <ul>
              <li><strong>Company:</strong> ${application.job.company?.name || "Unknown Company"}</li>
            </ul>
            <p>If you have any questions, please contact the recruiter.</p>
            <p>Best regards,<br>Job Portal Team</p>
          `;
                try {
                    await sendEmail(application.applicant.email, emailSubject, emailText, emailHtml);
                } catch (emailError) {
                    console.error("Failed to send email for deleted application:", emailError.message);
                }
            }
        } catch (error) {
            console.error("Error in change stream:", error);
        }
    });

    changeStream.on("error", (error) => {
        console.error("Change stream error:", error);
    });
};