import api from './axios.js';

export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
  getOrderHistory: () => api.get('/orders/history'),
};
