import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot Password?
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {isSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Code Sent Successfully!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              A 6-digit verification code has been sent to:
            </p>
            <p className="text-primary-600 dark:text-primary-400 font-semibold mb-4">
              {email}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📧 Check your email inbox (and spam folder)
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                ⏱️ Code expires in 10 minutes
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/reset-password"
                state={{ email }}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Enter Verification Code
              </Link>
              <button
                onClick={() => setIsSent(false)}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email Entry
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
