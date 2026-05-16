import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import reviewRoutes from './review.routes.js';
import cartRoutes from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import couponRoutes from './coupon.routes.js';
import specialProductRoutes from './specialProduct.routes.js';
import siteReviewRoutes from './siteReview.routes.js';
import heroRoutes from './hero.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/special-products', specialProductRoutes);
router.use('/site-reviews', siteReviewRoutes);
router.use('/heroes', heroRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
