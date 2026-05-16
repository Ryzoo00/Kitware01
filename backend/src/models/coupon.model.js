import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: [0, 'Discount value cannot be negative'],
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableCategories: [{
    type: String,
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startDate || now > this.endDate) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  return true;
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(subtotal) {
  if (subtotal < this.minPurchase) return 0;
  
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = subtotal * (this.discountValue / 100);
  } else {
    discount = this.discountValue;
  }
  
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return Math.round(discount * 100) / 100;
};

export const Coupon = mongoose.model('Coupon', couponSchema);
