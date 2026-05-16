import mongoose from 'mongoose';

const specialProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  firstOfferDescription: {
    type: String,
    required: [true, 'First offer description is required'],
    trim: true,
    maxlength: [500, 'First offer description cannot exceed 500 characters']
  },
  secondOfferDescription: {
    type: String,
    required: [true, 'Second offer description is required'],
    trim: true,
    maxlength: [500, 'Second offer description cannot exceed 500 characters']
  },
  productDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  firstPrize: {
    type: String,
    required: [true, 'First prize is required'],
    trim: true
  },
  secondPrize: {
    type: String,
    required: [true, 'Second prize is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Kitchen', 'Dining', 'Accessories', 'Storage', 'Essentials', 'Electronics', 'Fashion', 'Home Decor', 'Gifts', 'Special Offers']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBanner: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  comparePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 30,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    first: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      selectedAt: Date
    },
    second: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      selectedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participant count
specialProductSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Virtual for calculating discounted price
specialProductSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0 && this.price > 0) {
    return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
  }
  return this.price;
});

// Index for searching
specialProductSchema.index({ title: 'text', firstOfferDescription: 'text', secondOfferDescription: 'text', productDescription: 'text', category: 'text' });

export default mongoose.model('SpecialProduct', specialProductSchema);
