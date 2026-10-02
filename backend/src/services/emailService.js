const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends automated email when candidate application status changes
 */
const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, newStatus) => {
  const mailOptions = {
    from: `"IntelliHire Recruitment" <${process.env.SMTP_USER}>`,
    to: applicantEmail,
    subject: `Update on your application for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Application Status Update</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>Your application status for <strong>${jobTitle}</strong> has been updated to:</p>
        <p style="font-size: 18px; font-weight: bold; color: #1976d2;">${newStatus}</p>
        <p>Log in to your IntelliHire portal to view more details.</p>
        <br/>
        <p>Best regards,<br/>The Recruitment Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Status update sent to ${applicantEmail}`);
  } catch (error) {
    console.error(`[Email Failed] Could not send email to ${applicantEmail}:`, error.message);
  }
};

/**
 * Sends formal interview invitation email
 */
const sendInterviewInviteEmail = async (applicantEmail, applicantName, jobTitle, interviewDetails) => {
  const mailOptions = {
    from: `"IntelliHire Recruitment" <${process.env.SMTP_USER}>`,
    to: applicantEmail,
    subject: `Interview Invitation: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Interview Invitation</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>We were impressed with your application for <strong>${jobTitle}</strong> and would like to invite you for an interview!</p>
        <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #1976d2;">
          ${interviewDetails}
        </blockquote>
        <p>Please reply to this email or confirm your availability via the candidate portal.</p>
        <br/>
        <p>Best regards,<br/>The Recruitment Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Interview invite sent to ${applicantEmail}`);
  } catch (error) {
    console.error(`[Email Failed] Could not send interview invite to ${applicantEmail}:`, error.message);
  }
};

module.exports = { sendStatusUpdateEmail, sendInterviewInviteEmail };