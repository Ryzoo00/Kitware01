import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables first
dotenv.config();

import { config } from './config/index.js';
import { connectDB } from './db/connection.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import reviewRoutes from './routes/review.routes.js';
import cartRoutes from './routes/cart.routes.js';
import categoryRoutes from './routes/category.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import specialProductRoutes from './routes/specialProduct.routes.js';
import siteReviewRoutes from './routes/siteReview.routes.js';
import heroRoutes from './routes/hero.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [config.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3008', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// CORS preflight for all routes
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 1000 : 100, // limit each IP to 1000 requests in dev, 100 in production
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/special-products', specialProductRoutes);
app.use('/api/site-reviews', siteReviewRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Default route for base URL
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to LuxeLiving API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      categories: '/api/categories'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    
    // Drop old index to fix guest review issue
    if (dbConnected) {
      try {
        const db = mongoose.connection.db;
        const indexes = await db.collection('reviews').indexes();
        const oldIndex = indexes.find(i => i.name === 'user_1_product_1');
        if (oldIndex && !oldIndex.partialFilterExpression) {
          await db.collection('reviews').dropIndex('user_1_product_1');
          console.log('Dropped old user_1_product_1 index');
        }
      } catch (err) {
        console.log('Index check:', err.message);
      }
    }
    
    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      if (!dbConnected) {
        console.log('⚠️  Running in DEMO mode without database');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
