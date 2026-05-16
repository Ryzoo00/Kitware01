import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All cart routes are protected
router.get('/', protect, getCart);
router.post('/items', protect, addToCart);
router.put('/items/:itemId', protect, updateCartItem);
router.delete('/items/:itemId', protect, removeFromCart);
router.delete('/', protect, clearCart);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);

export default router;
