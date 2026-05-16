import express from 'express';
import {
  getAnalyticsOverview,
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProducts,
  getUserAnalytics,
  getAllAnalytics
} from '../controllers/analytics.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes are protected and admin-only
router.use(protect, adminOnly);

// Overview stats
router.get('/overview', getAnalyticsOverview);

// Time-series sales data
router.get('/sales', getSalesAnalytics);

// Category distribution
router.get('/categories', getCategoryAnalytics);

// Top performing products
router.get('/top-products', getTopProducts);

// User analytics
router.get('/users', getUserAnalytics);

// Comprehensive analytics - all in one
router.get('/all', getAllAnalytics);

export default router;
