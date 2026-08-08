const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

// Create Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URI used to generate tokens
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Verify connection to Gmail API on startup
const verifyGmailAPI = async () => {
  try {
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log(`✅ Gmail API is ready. Connected to: ${profile.data.emailAddress}`);
  } catch (error) {
    console.error('❌ Gmail API configuration error:', error.message);
  }
};
verifyGmailAPI();

/**
 * Helper to build and encode a MIME email message for the Gmail API
 * @param {string} to
 * @param {string} subject
 * @param {string} htmlContent
 */
const buildRawEmail = (to, subject, htmlContent) => {
  const sender = `Evntix <${process.env.GMAIL_USER}>`;
  
  // Format the MIME message headers and body with compliant CRLF (\r\n) line endings
  const parts = [
    `to: ${to}`,
    `from: ${sender}`,
    `subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '', // Empty line separating headers and body
    Buffer.from(htmlContent).toString('base64'),
  ];
  
  const mimeMessage = parts.join('\r\n');
  
  // Base64url encode the entire MIME message
  return Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Sends a booking confirmation email
 * @param {string} userEmail 
 * @param {string} userName 
 * @param {string} eventTitle 
 */
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const subject = `🎉 Booking Confirmed: ${eventTitle}`;
    const htmlContent = `
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
    `;

    const raw = buildRawEmail(userEmail, subject, htmlContent);
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });

    console.log(`✅ Booking confirmation email sent to ${userEmail} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending booking email to ${userEmail}:`, error.message);
    throw error;
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

    const htmlContent = `
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
    `;

    const raw = buildRawEmail(userEmail, title, htmlContent);
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });

    console.log(`✅ OTP email [${type}] sent to ${userEmail} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending OTP email [${type}] to ${userEmail}:`, error.message);
    throw error;
  }
};

module.exports = { sendBookingEmail, sendOTPEmail };
