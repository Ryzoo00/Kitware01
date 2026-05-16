import api from './axios.js';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity, options = {}) => api.post('/cart', { productId, quantity, ...options }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};
