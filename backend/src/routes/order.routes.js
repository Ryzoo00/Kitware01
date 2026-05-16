import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
