import { User } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { config } from '../config/index.js';
import { sendOTPEmail } from '../utils/emailService.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user with OTP
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.status = 400;
      throw error;
    }

    // Check for duplicate @gmail.com
    if (email.includes('@gmail.com@gmail.com')) {
      const error = new Error('Invalid email: duplicate @gmail.com');
      error.status = 400;
      throw error;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User already exists with this email');
      error.status = 400;
      throw error;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user with OTP (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false,
      otp,
      otpExpiry,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.message);
      // Don't fail registration, user can resend OTP
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP.',
      data: {
        email: user.email,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Login attempt:', { email, passwordLength: password?.length });

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? { id: user._id, email: user.email, hasPassword: !!user.password, emailVerified: user.emailVerified } : 'No user found');
    
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Check if user is blocked
    if (user.isBlocked) {
      const error = new Error('Your account has been blocked');
      error.status = 403;
      throw error;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      const error = new Error('Please verify your email first');
      error.status = 403;
      throw error;
    }

    // Check password
    // Diagnostic: Check if password is properly hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isProperlyHashed = user.password && /^\$2[aby]\$/.test(user.password);
    console.log('🔐 Password check:', { isMatch: false, passwordLength: password?.length, hashedPasswordLength: user.password?.length, isProperlyHashed });

    if (!isProperlyHashed) {
      // Password was not hashed properly - fix it by re-hashing
      console.log('⚠️ Password not properly hashed, fixing...');
      const bcrypt = await import('bcryptjs');
      user.password = await bcrypt.hash(user.password, 12);
      await user.save();
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match result:', isMatch);

    if (!isMatch) {
      const error = new Error('Invalid credentials - password does not match');
      error.status = 401;
      throw error;
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    if (user.emailVerified) {
      const error = new Error('Email already verified');
      error.status = 400;
      throw error;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTPCode = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Check if already verified
    if (user.emailVerified) {
      const error = new Error('Email already verified');
      error.status = 400;
      throw error;
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpiry) {
      const error = new Error('No OTP found. Please register again.');
      error.status = 400;
      throw error;
    }

    // Check if OTP expired
    if (Date.now() > user.otpExpiry) {
      const error = new Error('OTP has expired. Please request a new one.');
      error.status = 400;
      throw error;
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      const error = new Error('Invalid OTP');
      error.status = 400;
      throw error;
    }

    // Verify user and clear OTP
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You are now logged in.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log(`\n🔐 PASSWORD RESET REQUEST FOR: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found with this email');
      error.status = 404;
      throw error;
    }

    // Generate reset token (simple OTP for now)
    const resetToken = generateOTP();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`🔑 Generated Reset Token: ${resetToken}`);
    console.log(`⏱️ Token expires at: ${resetTokenExpiry.toLocaleString()}`);

    // Save to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    console.log(`✅ Token saved to database for user: ${email}`);

    // Send reset email with custom message
    const { sendOTPEmail } = await import('../utils/emailService.js');
    const emailResult = await sendOTPEmail(email, resetToken, 'password-reset');

    console.log(`📧 Email send result: ${emailResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!emailResult.success) {
      console.log(`⚠️ Check backend console for the token!`);
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password, confirmPassword } = req.body;
    
    console.log('🔑 Reset password request received:', {
      email,
      tokenLength: token?.length,
      passwordLength: password?.length,
      hasConfirmPassword: !!confirmPassword
    });

    // Validate passwords match
    if (password !== confirmPassword) {
      const error = new Error('Passwords do not match');
      error.status = 400;
      throw error;
    }

    // Validate password length
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.status = 400;
      throw error;
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('User not found with this email');
      error.status = 404;
      throw error;
    }

    // Check if reset token exists
    if (!user.resetPasswordToken || !user.resetPasswordExpiry) {
      console.log(`❌ No reset token found in database for: ${email}`);
      const error = new Error('No reset token found. Please request a new password reset.');
      error.status = 400;
      throw error;
    }

    // Check if token expired
    if (Date.now() > user.resetPasswordExpiry) {
      console.log(`❌ Token expired for: ${email}`);
      console.log(`   Token expired at: ${user.resetPasswordExpiry.toLocaleString()}`);
      console.log(`   Current time: ${new Date().toLocaleString()}`);
      const error = new Error('Reset token has expired. Please request a new one.');
      error.status = 400;
      throw error;
    }

    // Check if token matches
    console.log(`🔍 Comparing tokens:`);
    console.log(`   Token from email: ${token}`);
    console.log(`   Token in database: ${user.resetPasswordToken}`);
    console.log(`   Match: ${user.resetPasswordToken === token}`);
    
    if (user.resetPasswordToken !== token) {
      console.log(`❌ Token mismatch for: ${email}`);
      const error = new Error('Invalid reset token');
      error.status = 400;
      throw error;
    }

    console.log(`✅ Token verified successfully for: ${email}`);

    // Store old password in history (if not already there)
    if (!user.previousPasswords) {
      user.previousPasswords = [];
    }
    
    // Check if this password was used before
    const bcrypt = await import('bcryptjs');
    const isPreviouslyUsed = await Promise.all(
      user.previousPasswords.map(async (hashedPassword) => {
        return await bcrypt.compare(password, hashedPassword);
      })
    );

    if (isPreviouslyUsed.some(match => match)) {
      const error = new Error('Cannot reuse a previous password. Please choose a different password.');
      error.status = 400;
      throw error;
    }

    // Add current password to history before changing
    if (user.password) {
      user.previousPasswords.push(user.password);
      // Keep only last 5 passwords to prevent unlimited growth
      if (user.previousPasswords.length > 5) {
        user.previousPasswords = user.previousPasswords.slice(-5);
      }
    }

    // Update password - this will trigger the pre-save hook to hash the password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    console.log(`✅ Password reset successful for user: ${email}`);
    console.log(`🗑️ Old password deleted and added to history`);

    res.json({
      success: true,
      message: 'Password reset successful. Your old password has been deleted. Please login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
