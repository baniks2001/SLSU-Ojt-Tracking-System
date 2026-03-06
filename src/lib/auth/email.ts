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

export async function sendOTPEmail(email: string, otpCode: string, userName: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'SLSU OJT Tracking System - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
          <div style="background-color: #003366; color: white; padding: 20px; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
            🔐
          </div>
          <h2 style="color: #003366; margin-bottom: 20px;">Password Reset Code</h2>
          <p>Hello ${userName},</p>
          <p>You have requested to reset your password. Use the following One-Time Password (OTP) code to proceed:</p>
          <div style="background-color: #f0f0f0; border: 2px dashed #003366; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #003366;">${otpCode}</span>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>This OTP code will expire in 15 minutes.</strong>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you did not request this password reset, please ignore this email or contact the administrator immediately.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #999;">Southern Leyte State University - OJT Tracking System</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendTemporaryPasswordEmail(email: string, temporaryPassword: string, userName: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'SLSU OJT Tracking System - Temporary Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
          <div style="background-color: #003366; color: white; padding: 20px; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
            🔐
          </div>
          <h2 style="color: #003366; margin-bottom: 20px;">Temporary Password Generated</h2>
          <p>Hello ${userName},</p>
          <p>You have requested to reset your password. A temporary password has been generated for you.</p>
          <div style="background-color: #f0f0f0; border: 2px solid #003366; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Temporary Password:</p>
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #003366; font-family: monospace;">${temporaryPassword}</span>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>Important:</strong> Please use this temporary password to log in and change your password immediately.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you did not request this password reset, please contact the administrator immediately.
          </p>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Log In Now</a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #999;">Southern Leyte State University - OJT Tracking System</p>
        </div>
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
