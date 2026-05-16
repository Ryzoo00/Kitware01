import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getTrendingProducts,
  toggleTrending,
} from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProduct);

// Protected admin routes
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.put('/:id/trending', protect, adminOnly, toggleTrending);

export default router;
