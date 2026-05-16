import api from './axios.js';

export const productApi = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getTrendingProducts: () => api.get('/products/trending'),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
  getCategories: () => api.get('/categories'),
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  addReview: (productId, review) => api.post(`/products/${productId}/reviews`, review),
};
