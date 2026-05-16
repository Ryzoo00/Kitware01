import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  uploadAvatar,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// User profile routes (protected)
router.get('/profile/me', protect, getUserProfile);
router.put('/profile/me', protect, updateUserProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, toggleWishlist);

// Admin routes
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
