import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const response = await axiosInstance.get('/users/wishlist');
          set({ wishlist: response.data.data || [], error: null });
        } catch (error) {
          set({ error: error.response?.data?.message });
        }
      },

      addToWishlist: async (productId, productType = 'Product') => {
        set({ isLoading: true, error: null });
        try {
          console.log('Adding to wishlist:', { productId, productType });
          const response = await axiosInstance.post('/users/wishlist', { productId, productType });
          console.log('Wishlist response:', response.data);
          set({ wishlist: response.data.data || [], isLoading: false });
          toast.success('Added to wishlist!');
          return { success: true };
        } catch (error) {
          console.error('Wishlist error:', error.response?.data || error.message);
          set({ error: error.response?.data?.message, isLoading: false });
          toast.error(error.response?.data?.message || 'Failed to add to wishlist');
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeFromWishlist: async (productId, productType = 'Product') => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/users/wishlist', { productId, productType });
          set({ wishlist: response.data.data || [], isLoading: false });
          toast.success('Removed from wishlist');
          return { success: true };
        } catch (error) {
          set({ error: error.response?.data?.message, isLoading: false });
          toast.error('Failed to remove from wishlist');
          return { success: false, error: error.response?.data?.message };
        }
      },

      isInWishlist: (productId, productType = 'Product') => {
        const { wishlist } = get();
        return wishlist.some((item) => {
          const itemProductId = item.product?._id || item._id;
          const itemProductType = item.productType || 'Product';
          return itemProductId === productId && itemProductType === productType;
        });
      },

      clearWishlist: () => {
        set({ wishlist: [], error: null });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
