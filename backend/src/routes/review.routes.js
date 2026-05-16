import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  moderateReview,
  markHelpful,
} from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);
router.put('/:id/helpful', markHelpful);

// Protected routes
router.post('/', createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.put('/:id/moderate', protect, adminOnly, moderateReview);

export default router;
