import api from './axios.js';

export const reviewApi = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getUserReviews: () => api.get('/reviews/user'),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  getSiteReviews: () => api.get('/site-reviews'),
  createSiteReview: (data) => api.post('/site-reviews', data),
};
