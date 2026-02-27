import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, tempPassword: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'SLSU OJT Tracking System - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Password Reset - SLSU OJT Tracking System</h2>
        <p>Hello,</p>
        <p>You have requested a password reset for your account.</p>
        <p><strong>Your temporary password is:</strong> <span style="background-color: #f0f0f0; padding: 5px 10px; font-weight: bold;">${tempPassword}</span></p>
        <p>Please use this temporary password to log in and then change your password immediately for security purposes.</p>
        <p style="color: #666;">If you did not request this password reset, please ignore this email or contact the administrator.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">Southern Leyte State University - OJT Tracking System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendAccountApprovedEmail(email: string, firstName: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'SLSU OJT Tracking System - Account Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Account Approved - SLSU OJT Tracking System</h2>
        <p>Hello ${firstName},</p>
        <p>Congratulations! Your student account has been approved by your OJT Advisor.</p>
        <p>You can now log in to the system and start tracking your daily time records.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">Southern Leyte State University - OJT Tracking System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDepartmentApprovedEmail(email: string, departmentName: string, ojtAdvisorName: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'SLSU OJT Tracking System - Department Account Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Department Account Approved - SLSU OJT Tracking System</h2>
        <p>Hello ${ojtAdvisorName},</p>
        <p>Congratulations! Your department account for <strong>${departmentName}</strong> has been approved by the Super Administrator.</p>
        <p>You can now log in to the system and:</p>
        <ul>
          <li>View and manage students registered under your department</li>
          <li>Approve student registrations</li>
          <li>Post announcements for your students</li>
          <li>Monitor student attendance and DTR records</li>
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999;">Southern Leyte State University - OJT Tracking System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
