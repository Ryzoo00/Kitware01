import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { uploadToCloudinary } from '../utils/upload.js';
import {
  getSpecialProducts,
  getSpecialProduct,
  createSpecialProduct,
  updateSpecialProduct,
  deleteSpecialProduct,
  joinSpecialProduct,
  selectWinners,
  uploadBanner,
  getBanner
} from '../controllers/specialProduct.controller.js';

const router = express.Router();

// Public routes - specific routes MUST come before parameterized routes
router.get('/', getSpecialProducts);

// Banner routes - must be before /:id route
router.get('/banner', getBanner);
router.get('/banner/test', (req, res) => {
  res.json({ success: true, message: 'Banner route is working' });
});

// Simple test upload without auth/db - with Cloudinary
router.post('/banner/test-upload', upload.single('banner'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file' });
  }

  try {
    console.log('Test upload - file received:', req.file.path);
    const cloudinaryUrl = await uploadToCloudinary(req.file.path);
    res.json({
      success: true,
      message: 'File uploaded to Cloudinary',
      cloudinaryUrl,
      file: req.file.originalname
    });
  } catch (error) {
    console.error('Test upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed: ' + error.message,
      error: error.message
    });
  }
});

router.post('/banner/upload', protect, adminOnly, (req, res, next) => {
  upload.single('banner')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message,
        error: err.message
      });
    }
    next();
  });
}, uploadBanner);

// Parameterized routes - must be AFTER specific routes
router.get('/:id', getSpecialProduct);

// Protected routes - Admin only
router.post('/', 
  protect, 
  adminOnly, 
  upload.array('images', 10), 
  createSpecialProduct
);

router.put('/:id', 
  protect, 
  adminOnly, 
  upload.array('images', 10), 
  updateSpecialProduct
);

router.delete('/:id', 
  protect, 
  adminOnly, 
  deleteSpecialProduct
);

router.post('/:id/join', protect, joinSpecialProduct);
router.post('/:id/winners', protect, adminOnly, selectWinners);

export default router;
