import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuthStore();

  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please register again.');
      navigate('/register');
      return;
    }

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const result = await verifyOTP(email, otp);
    setIsLoading(false);

    if (result.success) {
      toast.success('Email verified! Welcome to KITware!');
      navigate('/');
    } else {
      toast.error(result.error || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const result = await resendOTP(email);
    setIsLoading(false);

    if (result.success) {
      toast.success('New OTP sent to your email!');
      setCountdown(60);
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error(result.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verify Email
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit OTP sent to<br />
            <span className="font-medium text-gray-900 dark:text-white">{email}</span>
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-bold"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify OTP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link
            to="/register"
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Back to Register
          </Link>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isLoading}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-500 disabled:text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
