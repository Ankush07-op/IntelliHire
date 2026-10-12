const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generates custom HTML email templates based on pipeline status
 */
const getTemplateByStatus = (applicantName, jobTitle, status) => {
  const baseStyle = "font-family: Arial, sans-serif; padding: 20px; color: #333;";
  
  if (status === 'Shortlisted') {
    return `
      <div style="${baseStyle}">
        <h2 style="color: #1976d2;">Good News, ${applicantName}!</h2>
        <p>Your application for the <strong>${jobTitle}</strong> position stood out to our team, and you have been <strong>Shortlisted</strong>!</p>
        <p>Our recruitment team is currently reviewing your profile in detail. We will reach out shortly with the next steps.</p>
        <br/><p>Best regards,<br/>The IntelliHire Recruitment Team</p>
      </div>
    `;
  }
  
  if (status === 'Offered') {
    return `
      <div style="${baseStyle} border: 2px solid #4caf50; border-radius: 8px;">
        <h2 style="color: #4caf50; text-align: center;">Congratulations! 🎉</h2>
        <p>Hi ${applicantName},</p>
        <p>We are thrilled to extend an offer to you for the <strong>${jobTitle}</strong> position!</p>
        <p>Your skills and experience are exactly what we are looking for. Our HR team will be in touch shortly with your official offer letter and onboarding details.</p>
        <br/><p>Welcome to the team!<br/>The IntelliHire Recruitment Team</p>
      </div>
    `;
  }

  if (status === 'Rejected') {
    return `
      <div style="${baseStyle}">
        <h2>Update on your application</h2>
        <p>Hi ${applicantName},</p>
        <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> role. While your background is impressive, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
        <p>We will keep your resume on file for future openings.</p>
        <br/><p>We wish you the best in your job search.<br/>The IntelliHire Recruitment Team</p>
      </div>
    `;
  }

  // Default Applied/General template
  return `
    <div style="${baseStyle}">
      <h2>Application Status Update</h2>
      <p>Hi ${applicantName},</p>
      <p>Your application status for <strong>${jobTitle}</strong> has been updated to: <strong style="color: #1976d2;">${status}</strong>.</p>
      <p>Log in to your IntelliHire portal to view more details.</p>
      <br/><p>Best regards,<br/>The Recruitment Team</p>
    </div>
  `;
};

const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, newStatus) => {
  const mailOptions = {
    from: `"IntelliHire Recruitment" <${process.env.SMTP_USER}>`,
    to: applicantEmail,
    subject: newStatus === 'Offered' ? `Job Offer: ${jobTitle}` : `Update on your application: ${jobTitle}`,
    html: getTemplateByStatus(applicantName, jobTitle, newStatus),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] ${newStatus} notification sent to ${applicantEmail}`);
  } catch (error) {
    console.error(`[Email Failed] Could not send email to ${applicantEmail}:`, error.message);
  }
};

const sendInterviewInviteEmail = async (applicantEmail, applicantName, jobTitle, interviewDetails) => {
  const mailOptions = {
    from: `"IntelliHire Recruitment" <${process.env.SMTP_USER}>`,
    to: applicantEmail,
    subject: `Interview Invitation: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1976d2;">Interview Invitation</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p>We were very impressed with your background and would like to invite you for an interview for the <strong>${jobTitle}</strong> role.</p>
        <blockquote style="background: #f4f4f4; padding: 15px; border-left: 4px solid #1976d2; margin: 20px 0;">
          ${interviewDetails.replace(/\n/g, '<br/>')}
        </blockquote>
        <p>Please reply directly to this email to confirm your availability.</p>
        <br/>
        <p>Best regards,<br/>The IntelliHire Recruitment Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendStatusUpdateEmail, sendInterviewInviteEmail };