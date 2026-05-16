import express from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', protect, adminOnly, getCoupons);
router.get('/:id', protect, adminOnly, getCoupon);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
