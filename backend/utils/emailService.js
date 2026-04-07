const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOTP = async (email, otp) => {
  // During development, we'll use a test account from Ethereal Mail
  // If you provide real SMTP credentials in .env, it will use those.
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('--- REAL SMTP SERVICE CONFIGURATION ---');
    console.log('Using SMTP Host:', process.env.SMTP_HOST);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Mail for easy testing
    console.log('--- WARNING: NO REAL SMTP CONFIGURED ---');
    console.log('OTP emails will NOT be sent to real inboxes.');
    console.log('Check server logs for Ethereal Mail preview URLs.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"CRM Pro Support" <${process.env.SMTP_FROM || 'noreply@crmpro.com'}>`,
    to: email,
    subject: 'Verify Your Email - CRM Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to CRM Pro!</h2>
        <p>Thank you for signing up. To complete your registration, please verify your email address by entering the following One-Time Password (OTP):</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; 2026 CRM Pro. All rights reserved.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.SMTP_HOST) {
    console.log('OTP Sent: %s', otp);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = { sendOTP };
