import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const response = await axiosInstance.get('/cart');
          set({ cart: response.data.data, error: null });
        } catch (error) {
          set({ error: error.response?.data?.message });
        }
      },

      addToCart: async (productId, quantity = 1, color = null, size = null, productType = 'Product') => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post('/cart/items', {
            productId,
            quantity,
            color,
            size,
            productType,
          });
          set({ cart: response.data.data, isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to add to cart',
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          const response = await axiosInstance.put(`/cart/items/${itemId}`, {
            quantity,
          });
          set({ cart: response.data.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeFromCart: async (itemId) => {
        try {
          const response = await axiosInstance.delete(`/cart/items/${itemId}`);
          set({ cart: response.data.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      clearCart: async () => {
        try {
          const response = await axiosInstance.delete('/cart');
          set({ cart: response.data.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      applyCoupon: async (code) => {
        try {
          const response = await axiosInstance.post('/cart/coupon', { code });
          set({ cart: response.data.data });
          return { success: true, discount: response.data.data.coupon };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeCoupon: async () => {
        try {
          const response = await axiosInstance.delete('/cart/coupon');
          set({ cart: response.data.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      getItemCount: () => {
        const { cart } = get();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { cart } = get();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
