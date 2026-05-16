import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await axiosInstance.get('/auth/me');
          set({
            user: response.data.data,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login with:', { email, password: '***' });
          const response = await axiosInstance.post('/auth/login', {
            email,
            password,
          });
          console.log('Login response:', response.data);
          const { user, token } = response.data.data;
          console.log('User from login:', user);
          localStorage.setItem('token', token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/register', {
            name,
            email,
            password,
          });
          const { email: userEmail, requiresVerification } = response.data.data;
          set({
            isLoading: false,
            error: null,
          });
          return { success: true, email: userEmail, requiresVerification };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      verifyOTP: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/verify-otp', {
            email,
            otp,
          });
          const { user, token } = response.data.data;
          localStorage.setItem('token', token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'OTP verification failed',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'OTP verification failed',
          };
        }
      },

      resendOTP: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/auth/resend-otp', { email });
          set({
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to resend OTP',
          });
          return {
            success: false,
            error: error.response?.data?.message || 'Failed to resend OTP',
          };
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
