const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Reminder: Must be an App Password, not standard password
  },
  family: 4 // Force IPv4 to bypass Render's IPv6 connectivity limits
});

// Verify email service connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Nodemailer configuration error:', error.message);
  } else {
    console.log('✅ Email service is ready to send messages.');
  }
});

/**
 * Sends a booking confirmation email
 * @param {string} userEmail 
 * @param {string} userName 
 * @param {string} eventTitle 
 */
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: `"Evntix Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎉 Booking Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #111827;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h2 style="color: #4f46e5; margin-top: 0;">Booking Confirmed!</h2>
            <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
              Your spot for <strong>${eventTitle}</strong> is locked in! We can't wait to see you there.
            </p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Event</p>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #111827;">${eventTitle}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              Thank you for choosing <strong>Evntix</strong>.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${userEmail} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending booking email to ${userEmail}:`, error.message);
    throw error; // Pass error up to caller for HTTP 500 handling
  }
};

/**
 * Sends an OTP verification email
 * @param {string} userEmail 
 * @param {string|number} otp 
 * @param {'account_verification' | 'event_booking'} type 
 */
const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    const isAccountVerification = type === 'account_verification';

    const title = isAccountVerification ? 'Verify your Evntix Account' : 'Verify your Evntix Booking';

    const msg = isAccountVerification
      ? 'Please use the following OTP code to verify your new Evntix account:'
      : 'Please use the following OTP code to verify and complete your event booking:';

    const mailOptions = {
      from: `"Evntix Security" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #111827;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
            <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin-top: 0;">${title}</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">${msg}</p>
            
            <div style="margin: 28px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background-color: #eef2ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #c7d2fe; display: inline-block;">
                ${otp}
              </span>
            </div>

            <p style="font-size: 13px; color: #ef4444; font-weight: 500;">
              ⏱️ This code expires in 5 minutes.
            </p>
            
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email [${type}] sent to ${userEmail} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending OTP email [${type}] to ${userEmail}:`, error.message);
    throw error; // Pass error up to caller for HTTP 500 handling
  }
};

module.exports = { sendBookingEmail, sendOTPEmail };



// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");


// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// exports.sendOtpEmail = async (email,otp ,type )=>{
//     try{
//         const mailOptions = {
//             from : process.env.EMAIL_USER,
//             to : email,
//             subject : "Your OTP code",
//             text : `Your OTP code is : ${otp}`
//         };
//         await transporter.sendMail(mailOptions),
//         console.log(`OTP mail sent to ${email} for ${type}`);
//     }
//     catch(error){
//         console.error(`Error sending OTP email to ${email} for ${type}`,error);
//     }
// }