import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import {
  getHeroes,
  getHero,
  createHero,
  updateHero,
  deleteHero,
  toggleHeroStatus
} from '../controllers/hero.controller.js';

const router = express.Router();

// Public routes - for frontend carousel
router.get('/', getHeroes);

// Parameterized routes
router.get('/:id', getHero);

// Protected routes - Admin only
router.post('/', 
  protect, 
  adminOnly, 
  upload.single('image'), 
  createHero
);

router.put('/:id', 
  protect, 
  adminOnly, 
  upload.single('image'), 
  updateHero
);

router.delete('/:id', 
  protect, 
  adminOnly, 
  deleteHero
);

router.patch('/:id/toggle', 
  protect, 
  adminOnly, 
  toggleHeroStatus
);

export default router;
