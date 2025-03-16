import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Change this if using another email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (name: string, email: string, subject: string, message: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,  // Your email (sender)
      to: process.env.RECEIVER_EMAIL,  // Your email (receiver)
      replyTo: email,  // User's email for replying directly
      subject: `New Contact Form Message: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    });

    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
