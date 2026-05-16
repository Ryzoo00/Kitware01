import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff, Bug } from 'lucide-react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1 = email+token, 2 = new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get email from navigation state (from ForgotPassword page)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // DEBUG: Check what token is in database
  const debugToken = async () => {
    if (!email) {
      toast.error('Please enter email first');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/debug-reset-token', { email });
      console.log('=== DATABASE TOKEN INFO ===');
      console.log(response.data);
      
      const { resetPasswordToken, resetPasswordExpiry, isExpired } = response.data.data;
      
      alert(
        `DEBUG INFO:\n\n` +
        `Token in DB: ${resetPasswordToken || 'NONE'}\n` +
        `Expires: ${resetPasswordExpiry ? new Date(resetPasswordExpiry).toLocaleString() : 'NONE'}\n` +
        `Is Expired: ${isExpired}\n` +
        `Your entered token: ${token || 'NONE'}\n` +
        `Match: ${resetPasswordToken === token ? 'YES ✓' : 'NO ✗'}`
      );
      
      toast.success('Check browser console for full debug info');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Failed to debug - check console');
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();

    if (!email || !token) {
      toast.error('Please enter both email and reset code');
      return;
    }

    if (token.length !== 6) {
      toast.error('Reset code must be 6 digits');
      return;
    }

    // Move to password reset step
    setStep(2);
    toast.success('Reset code verified! Enter your new password.');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please enter both password fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== RESETTING PASSWORD ===');
      console.log('Email:', email);
      console.log('Token:', token);
      console.log('Token length:', token?.length);
      console.log('Password length:', password?.length);
      console.log('Full request:', { email, token, password, confirmPassword });
      
      const response = await authApi.resetPassword(email, token, password, confirmPassword);
      console.log('Password reset response:', response.data);
      setIsSuccess(true);
      toast.success(response.data.message || 'Password reset successful!');
    } catch (error) {
      console.error('Reset password error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      // If it's a password reuse error, show specific message
      if (errorMessage.includes('Cannot reuse')) {
        toast.error('Please choose a different password that you haven\'t used before');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full space-y-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your password has been successfully updated.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔒 Your old password has been deleted from the system.
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                ✓ Password history updated for security.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full space-y-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              KITware
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {step === 1 ? 'Enter your email and the reset code from your email' : 'Create a new password for your account'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reset Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code from email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white tracking-widest text-center font-mono text-lg"
                  required
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Verify Code
            </button>

            {/* DEBUG BUTTON */}
            <button
              type="button"
              onClick={debugToken}
              className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Bug className="w-4 h-4" />
              Debug: Check Token in Database
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Forgot Password
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Email:</span> {email}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Code:</span> {token}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Code Entry
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
