import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
    default: 0,
  },
  images: [{
    type: String,
    required: [true, 'Please provide at least one image'],
  }],
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: ['Kitchen', 'Dining', 'Accessories', 'Storage', 'Essentials', 'Electronics', 'Fashion', 'Home Decor', 'Gifts'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  sku: {
    type: String,
    default: null,
  },
  attributes: [{
    name: String,
    options: [String],
  }],
  colors: [{
    name: String,
    hex: String,
    image: String,
  }],
  sizes: [{
    name: String,
    stock: { type: Number, default: 0 },
  }],
  weight: {
    type: Number,
    default: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: val => Math.round(val * 10) / 10,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  salesCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: Date,
    endDate: Date,
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for calculating discount price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount.percentage > 0) {
    const now = new Date();
    if ((!this.discount.startDate || now >= this.discount.startDate) &&
        (!this.discount.endDate || now <= this.discount.endDate)) {
      return Math.round(this.price * (1 - this.discount.percentage / 100) * 100) / 100;
    }
  }
  return this.price;
});

// Virtual for checking if product is on sale
productSchema.virtual('isOnSale').get(function() {
  if (this.discount && this.discount.percentage > 0) {
    const now = new Date();
    return (!this.discount.startDate || now >= this.discount.startDate) &&
           (!this.discount.endDate || now <= this.discount.endDate);
  }
  return false;
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
