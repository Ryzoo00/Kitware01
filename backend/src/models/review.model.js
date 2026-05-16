import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  detailB: {
    type: String,
    trim: true,
    maxlength: [200, 'Detail B cannot exceed 200 characters'],
  },
  images: [{
    type: String,
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Prevent duplicate reviews from same user on same product (only for authenticated users)
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true, $ne: null } } });

export const Review = mongoose.model('Review', reviewSchema);
