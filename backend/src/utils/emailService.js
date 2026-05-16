import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with proper Gmail SMTP settings
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log('📧 Creating email transporter...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter is ready to send messages');
      }
    });
  }
  return transporter;
};

// Store OTP codes temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'registration') => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || 
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your_email@gmail.com' ||
      process.env.EMAIL_USER.includes('REPLACE_')) {
    console.log(`\n========================================`);
    console.log(`📧 OTP FOR ${email}: ${otp}`);
    console.log(`========================================\n`);
    console.log('⚠️  Email not configured - OTP logged to console only');
    return { success: true, message: 'OTP logged to console (email not configured)', otp };
  }

  console.log(`📧 Attempting to send ${type} email to: ${email}`);
  console.log(`📧 From: ${process.env.EMAIL_USER}`);

  // Different content based on email type
  const isPasswordReset = type === 'password-reset';
  
  const mailOptions = {
    from: `"KITware" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: isPasswordReset ? 'Your KITware Password Reset Code' : 'Your KITware Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">KIT<span style="font-family: cursive; color: #000;">ware</span></h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">${isPasswordReset ? 'Reset Your Password' : 'Verify Your Email'}</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ${isPasswordReset 
              ? 'You have requested to reset your password. Please use the verification code below to proceed:'
              : 'Thank you for registering with KITware! To complete your registration, please enter the OTP code below:'
            }
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-size: 32px; font-weight: bold; padding: 20px 40px; border-radius: 10px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This code will expire in <strong>${isPasswordReset ? '10 minutes' : '5 minutes'}</strong>.
          </p>
          
          <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 KITware. All rights reserved.</p>
        </div>
      </div>
    `,
    text: isPasswordReset 
      ? `Your KITware password reset code is: ${otp}. This code expires in 10 minutes.`
      : `Your KITware verification code is: ${otp}. This code expires in 5 minutes.`
  };

  try {
    console.log('📤 Sending email...');
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    return { success: true, message: 'OTP email sent', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send FAILED:', error.message);
    console.error('❌ Full error:', error);
    return { success: false, message: `Failed to send email: ${error.message}`, error: error.message };
  }
};

// Store OTP
export const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });
  console.log(`📧 OTP stored for ${email}: ${otp}`);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const data = otpStore.get(email);
  
  if (!data) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (Date.now() > data.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (data.attempts >= 3) {
    otpStore.delete(email);
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (data.otp !== otp) {
    data.attempts += 1;
    return { valid: false, message: `Invalid OTP. ${3 - data.attempts} attempts remaining.` };
  }
  
  // OTP is valid, delete it
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully' };
};

// Generate and send OTP
export const generateAndSendOTP = async (email) => {
  const otp = generateOTP();
  storeOTP(email, otp);
  return await sendOTPEmail(email, otp);
};

// Check if email has pending OTP
export const hasPendingOTP = (email) => {
  const data = otpStore.get(email);
  return data && Date.now() < data.expiresAt;
};

// Clear pending OTP (for testing/debugging)
export const clearPendingOTP = (email) => {
  otpStore.delete(email);
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return { success: false, message: error.message };
  }
};
