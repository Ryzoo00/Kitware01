import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, logout, getMe, resendOTP, verifyOTPCode, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { sendOTPEmail, testEmailConfig } from '../utils/emailService.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Please provide a valid 6-digit OTP'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// OTP verification routes
router.post('/resend-otp', emailValidation, resendOTP);
router.post('/verify-otp', otpValidation, verifyOTPCode);

// Password reset routes
router.post('/forgot-password', emailValidation, forgotPassword);

// Reset password with token
const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Please provide a valid 6-digit reset token'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .withMessage('Passwords do not match'),
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);

// DEBUG: Check reset token in database (REMOVE IN PRODUCTION)
router.post('/debug-reset-token', async (req, res) => {
  try {
    const { email } = req.body;
    const { User } = await import('../models/user.model.js');
    
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpiry');
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        email: user.email,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpiry: user.resetPasswordExpiry,
        isExpired: user.resetPasswordExpiry ? Date.now() > user.resetPasswordExpiry : true,
        currentTime: new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Testing email to:', email);
    
    // Test transporter config
    const configTest = await testEmailConfig();
    console.log('Config test:', configTest);
    
    // Try to send test email
    const result = await sendOTPEmail(email, '123456');
    console.log('Send result:', result);
    
    res.json({
      success: result.success,
      message: result.message,
      configTest,
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

export default router;
