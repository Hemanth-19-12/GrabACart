/**
 * Grab A Cart — Automated Email Dispatch Service
 * 
 * Features:
 * 1. Automatic Virtual Inbox (Zero Personal Email Needed):
 *    Uses Nodemailer's built-in Ethereal Mail service to create a disposable test inbox
 *    and provide an instant clickable link to view the delivered email in your browser.
 * 2. Optional Production SMTP (SendGrid, Mailtrap, AWS SES, Resend) if configured.
 * 3. Offline console logging fallback.
 */

const nodemailer = require('nodemailer');

let testTransporter = null;

// Initialize or get the virtual test transporter
async function getTransporter() {
  // If custom production SMTP is explicitly configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Otherwise, use automatic virtual test inbox (No personal email needed!)
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📬 [VIRTUAL INBOX READY] Automated test email service initialized. Zero personal email required.');
    } catch (err) {
      console.log('ℹ️ [OFFLINE DISPATCH] Running in local offline simulation mode.');
    }
  }

  return testTransporter;
}

/**
 * Send password reset email with temporary code
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} tempCode - Temporary password / reset code
 */
async function sendPasswordResetEmail(toEmail, userName, tempCode) {
  const subject = `Your Grab A Cart India Password Reset Code: ${tempCode}`;
  
  const textContent = `
Namaste ${userName},

We received a request to reset your password for your Grab A Cart account (${toEmail}).

Your Temporary Password / Reset Code: ${tempCode}

This code is valid for the next 15 minutes. Enter this code on the website to set your new password.

If you did not request this, please ignore this email.

Warm regards,
Grab A Cart India Security Team
Bengaluru, Karnataka
`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #ff5722, #ff9933); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🛒 Grab A Cart India</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Secure Password Reset</p>
      </div>
      <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
        <h2 style="font-size: 18px; margin-top: 0;">Namaste ${userName},</h2>
        <p>We received a request to reset the password for your account (<strong>${toEmail}</strong>).</p>
        <p>Please use the temporary verification code below to reset your password:</p>
        <div style="background: #fff3e0; border: 2px dashed #ff9933; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #ff5722; font-family: monospace;">${tempCode}</span>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px;">⏱️ Valid for 15 minutes</div>
        </div>
        <p style="font-size: 14px; color: #64748b;">If you did not request this reset, you can safely ignore this email. Your account remains secure.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Grab A Cart India Pvt Ltd · Bengaluru, Karnataka · 100% Genuine Indian Marketplace
        </p>
      </div>
    </div>
  `;

  let previewUrl = null;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Grab A Cart Security" <security@grabacart.com>`,
        to: toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      previewUrl = nodemailer.getTestMessageUrl(info) || null;

      if (previewUrl) {
        console.log('\n======================================================');
        console.log(' 📬 [EMAIL SENT TO VIRTUAL INBOX]');
        console.log(`    Recipient:   ${toEmail} (${userName})`);
        console.log(`    Temp Code:   ${tempCode}`);
        console.log(`    🔗 Open in Browser: ${previewUrl}`);
        console.log('======================================================\n');
      } else {
        console.log('✅ [EMAIL DISPATCHED] Message ID:', info.messageId);
      }
    }
  } catch (err) {
    console.error('Email dispatch error (falling back to console logger):', err.message);
  }

  // Always log to terminal as well
  if (!previewUrl) {
    console.log('\n======================================================');
    console.log(' 📧 [EMAIL DISPATCH LOGGER]');
    console.log(`    Recipient: ${toEmail} (${userName})`);
    console.log(`    Temp Code: ${tempCode}`);
    console.log('======================================================\n');
  }

  return {
    success: true,
    tempCode,
    previewUrl
  };
}

/**
 * Send OTP verification email
 */
async function sendOTPEmail(toEmail, otpCode, purpose = 'Verification') {
  const subject = `Your Grab A Cart ${purpose} OTP: ${otpCode}`;
  let previewUrl = null;

  try {
    const transporter = await getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Grab A Cart" <auth@grabacart.com>`,
        to: toEmail,
        subject: subject,
        text: `Your Grab A Cart ${purpose} OTP code is: ${otpCode}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #ff5722;">Grab A Cart India</h2>
            <p>Your 6-digit OTP code for <strong>${purpose}</strong> is:</p>
            <h1 style="font-family: monospace; letter-spacing: 4px; color: #1e293b;">${otpCode}</h1>
            <p style="font-size: 12px; color: #64748b;">This OTP code is valid for 10 minutes.</p>
          </div>
        `
      });

      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      if (previewUrl) {
        console.log(`📬 [OTP EMAIL SENT] 🔗 Preview in Browser: ${previewUrl}`);
      }
    }
  } catch (err) {
    console.error('OTP email error:', err.message);
  }

  return {
    success: true,
    otpCode,
    previewUrl
  };
}

module.exports = {
  sendPasswordResetEmail,
  sendOTPEmail
};
