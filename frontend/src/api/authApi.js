import api from './axios.js';

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, token, password, confirmPassword) => {
    console.log('authApi.resetPassword called with:', { email, token, passwordLength: password?.length, confirmPasswordLength: confirmPassword?.length });
    return api.post('/auth/reset-password', { email, token, password, confirmPassword });
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};
