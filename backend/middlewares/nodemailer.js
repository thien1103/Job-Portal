import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        if (!to || typeof to !== "string" || !to.includes("@")) {
            throw new Error("Invalid or missing recipient email");
        }
        const mailOptions = {
            from: `"Job Search" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            code: error.code,
            response: error.response,
            responseCode: error.responseCode
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};