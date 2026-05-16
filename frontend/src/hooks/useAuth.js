import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, checkAuth, login, register, logout, clearError } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAdmin: user?.role === 'admin',
  };
};

export default useAuth;
