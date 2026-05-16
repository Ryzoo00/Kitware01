export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const APP_NAME = 'LuxeLiving';
export const APP_VERSION = '1.0.0';

export const CATEGORIES = [
  'Kitchen',
  'Dining',
  'Accessories',
  'Storage',
  'Essentials',
  'Electronics',
  'Fashion',
  'Home Decor',
  'Gifts',
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ITEMS_PER_PAGE = 12;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
