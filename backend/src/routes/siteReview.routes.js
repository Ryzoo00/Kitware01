import express from 'express';
import multer from 'multer';
import {
  createSiteReview,
  getAllSiteReviews,
  getPendingReviews,
  approveReview,
  deleteReview
} from '../controllers/siteReview.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getAllSiteReviews);

// Protected admin routes
router.post('/', upload.single('photo'), createSiteReview);
router.get('/pending', protect, adminOnly, getPendingReviews);
router.put('/:id/approve', protect, adminOnly, approveReview);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
